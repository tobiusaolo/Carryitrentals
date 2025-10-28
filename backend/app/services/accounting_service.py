"""
Accounting Service
Handles double-entry bookkeeping and financial statement generation
"""

from sqlalchemy.orm import Session
from typing import Dict, List, Optional
from datetime import date, datetime, timedelta
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

class AccountingService:
    """Service for accounting operations and financial reporting"""
    
    def record_rent_payment(self, db: Session, payment_id: int) -> bool:
        """
        Record rent payment in accounting system
        Debit: Bank Account (Asset)
        Credit: Rental Income (Revenue)
        """
        try:
            from ..models.payment import Payment
            from ..models.accounting import AccountingTransaction, JournalEntry, Account
            
            payment = db.query(Payment).filter(Payment.id == payment_id).first()
            if not payment:
                return False
            
            # Get accounts
            bank_account = db.query(Account).filter(Account.code == "1010").first()  # Bank Account
            rental_income = db.query(Account).filter(Account.code == "4010").first()  # Rental Income
            
            if not bank_account or not rental_income:
                logger.error("Required accounts not found")
                return False
            
            # Create transaction
            transaction = AccountingTransaction(
                date=payment.paid_date or date.today(),
                description=f"Rent payment - {payment.id}",
                reference=payment.reference_number,
                property_id=payment.unit.property_id if payment.unit else None,
                created_by_user_id=payment.payer_id
            )
            db.add(transaction)
            db.flush()
            
            # Create journal entries
            # Debit: Bank Account (increase asset)
            debit_entry = JournalEntry(
                transaction_id=transaction.id,
                account_id=bank_account.id,
                debit_amount=payment.amount,
                credit_amount=0,
                description=f"Rent received - {payment.id}"
            )
            
            # Credit: Rental Income (increase revenue)
            credit_entry = JournalEntry(
                transaction_id=transaction.id,
                account_id=rental_income.id,
                debit_amount=0,
                credit_amount=payment.amount,
                description=f"Rent income - {payment.id}"
            )
            
            db.add(debit_entry)
            db.add(credit_entry)
            db.commit()
            
            logger.info(f"Recorded rent payment {payment_id} in accounting system")
            return True
            
        except Exception as e:
            logger.error(f"Error recording rent payment: {str(e)}")
            db.rollback()
            return False
    
    def record_expense(self, db: Session, expense_id: int) -> bool:
        """
        Record expense in accounting system
        Debit: Expense Account
        Credit: Bank Account
        """
        try:
            from ..models.accounting import Expense, AccountingTransaction, JournalEntry, Account
            
            expense = db.query(Expense).filter(Expense.id == expense_id).first()
            if not expense:
                return False
            
            # Get accounts
            bank_account = db.query(Account).filter(Account.code == "1010").first()
            expense_account = expense.account if expense.account else db.query(Account).filter(
                Account.code == "5000"  # General Expenses
            ).first()
            
            if not bank_account or not expense_account:
                logger.error("Required accounts not found")
                return False
            
            # Create transaction
            transaction = AccountingTransaction(
                date=expense.date,
                description=f"{expense.category.value} - {expense.description}",
                reference=f"EXP-{expense.id}",
                property_id=expense.property_id,
                created_by_user_id=expense.created_by_user_id
            )
            db.add(transaction)
            db.flush()
            
            # Update expense with transaction_id
            expense.transaction_id = transaction.id
            
            # Create journal entries
            # Debit: Expense Account (increase expense)
            debit_entry = JournalEntry(
                transaction_id=transaction.id,
                account_id=expense_account.id,
                debit_amount=expense.amount,
                credit_amount=0,
                description=expense.description
            )
            
            # Credit: Bank Account (decrease asset)
            credit_entry = JournalEntry(
                transaction_id=transaction.id,
                account_id=bank_account.id,
                debit_amount=0,
                credit_amount=expense.amount,
                description=f"Payment for {expense.description}"
            )
            
            db.add(debit_entry)
            db.add(credit_entry)
            db.commit()
            
            logger.info(f"Recorded expense {expense_id} in accounting system")
            return True
            
        except Exception as e:
            logger.error(f"Error recording expense: {str(e)}")
            db.rollback()
            return False
    
    def generate_income_statement(
        self, 
        db: Session, 
        property_id: Optional[int] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict:
        """Generate Income Statement (Profit & Loss)"""
        try:
            from ..models.accounting import Account, JournalEntry, AccountingTransaction, AccountType
            
            if not start_date:
                start_date = date.today().replace(day=1)
            if not end_date:
                end_date = date.today()
            
            # Get all transactions for the period
            query = db.query(AccountingTransaction).filter(
                AccountingTransaction.date >= start_date,
                AccountingTransaction.date <= end_date
            )
            
            if property_id:
                query = query.filter(AccountingTransaction.property_id == property_id)
            
            transactions = query.all()
            transaction_ids = [t.id for t in transactions]
            
            # Get all journal entries for these transactions
            journal_entries = db.query(JournalEntry).filter(
                JournalEntry.transaction_id.in_(transaction_ids)
            ).all()
            
            # Calculate revenues
            revenue_accounts = db.query(Account).filter(Account.type == AccountType.REVENUE).all()
            revenue_totals = {}
            total_revenue = Decimal(0)
            
            for account in revenue_accounts:
                entries = [je for je in journal_entries if je.account_id == account.id]
                # Revenue increases with credits, decreases with debits
                account_total = sum(je.credit_amount - je.debit_amount for je in entries)
                revenue_totals[account.name] = float(account_total)
                total_revenue += account_total
            
            # Calculate expenses
            expense_accounts = db.query(Account).filter(Account.type == AccountType.EXPENSE).all()
            expense_totals = {}
            total_expenses = Decimal(0)
            
            for account in expense_accounts:
                entries = [je for je in journal_entries if je.account_id == account.id]
                # Expenses increase with debits, decrease with credits
                account_total = sum(je.debit_amount - je.credit_amount for je in entries)
                expense_totals[account.name] = float(account_total)
                total_expenses += account_total
            
            # Calculate net income
            net_income = total_revenue - total_expenses
            
            return {
                "period": {
                    "start_date": str(start_date),
                    "end_date": str(end_date)
                },
                "revenues": revenue_totals,
                "total_revenue": float(total_revenue),
                "expenses": expense_totals,
                "total_expenses": float(total_expenses),
                "net_income": float(net_income),
                "profit_margin": float((net_income / total_revenue * 100) if total_revenue > 0 else 0)
            }
            
        except Exception as e:
            logger.error(f"Error generating income statement: {str(e)}")
            return {"error": str(e)}
    
    def generate_balance_sheet(
        self,
        db: Session,
        property_id: Optional[int] = None,
        as_of_date: Optional[date] = None
    ) -> Dict:
        """Generate Balance Sheet"""
        try:
            from ..models.accounting import Account, JournalEntry, AccountingTransaction, AccountType
            
            if not as_of_date:
                as_of_date = date.today()
            
            # Get all transactions up to the date
            query = db.query(AccountingTransaction).filter(
                AccountingTransaction.date <= as_of_date
            )
            
            if property_id:
                query = query.filter(AccountingTransaction.property_id == property_id)
            
            transactions = query.all()
            transaction_ids = [t.id for t in transactions]
            
            # Get all journal entries
            journal_entries = db.query(JournalEntry).filter(
                JournalEntry.transaction_id.in_(transaction_ids)
            ).all()
            
            # Calculate Assets
            asset_accounts = db.query(Account).filter(Account.type == AccountType.ASSET).all()
            assets = {}
            total_assets = Decimal(0)
            
            for account in asset_accounts:
                entries = [je for je in journal_entries if je.account_id == account.id]
                # Assets increase with debits, decrease with credits
                account_balance = sum(je.debit_amount - je.credit_amount for je in entries)
                assets[account.name] = float(account_balance)
                total_assets += account_balance
            
            # Calculate Liabilities
            liability_accounts = db.query(Account).filter(Account.type == AccountType.LIABILITY).all()
            liabilities = {}
            total_liabilities = Decimal(0)
            
            for account in liability_accounts:
                entries = [je for je in journal_entries if je.account_id == account.id]
                # Liabilities increase with credits, decrease with debits
                account_balance = sum(je.credit_amount - je.debit_amount for je in entries)
                liabilities[account.name] = float(account_balance)
                total_liabilities += account_balance
            
            # Calculate Equity
            equity_accounts = db.query(Account).filter(Account.type == AccountType.EQUITY).all()
            equity = {}
            total_equity = Decimal(0)
            
            for account in equity_accounts:
                entries = [je for je in journal_entries if je.account_id == account.id]
                # Equity increases with credits, decrease with debits
                account_balance = sum(je.credit_amount - je.debit_amount for je in entries)
                equity[account.name] = float(account_balance)
                total_equity += account_balance
            
            # Add retained earnings (net income)
            income_stmt = self.generate_income_statement(db, property_id, None, as_of_date)
            retained_earnings = Decimal(income_stmt.get("net_income", 0))
            equity["Retained Earnings"] = float(retained_earnings)
            total_equity += retained_earnings
            
            return {
                "as_of_date": str(as_of_date),
                "assets": assets,
                "total_assets": float(total_assets),
                "liabilities": liabilities,
                "total_liabilities": float(total_liabilities),
                "equity": equity,
                "total_equity": float(total_equity),
                "balance_check": float(total_assets - (total_liabilities + total_equity))  # Should be 0
            }
            
        except Exception as e:
            logger.error(f"Error generating balance sheet: {str(e)}")
            return {"error": str(e)}
    
    def generate_cash_flow_statement(
        self,
        db: Session,
        property_id: Optional[int] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict:
        """Generate Cash Flow Statement"""
        try:
            from ..models.accounting import Account, JournalEntry, AccountingTransaction
            
            if not start_date:
                start_date = date.today().replace(day=1)
            if not end_date:
                end_date = date.today()
            
            # Get cash account
            cash_account = db.query(Account).filter(Account.code == "1010").first()
            if not cash_account:
                return {"error": "Cash account not found"}
            
            # Get all transactions for the period
            query = db.query(AccountingTransaction).filter(
                AccountingTransaction.date >= start_date,
                AccountingTransaction.date <= end_date
            )
            
            if property_id:
                query = query.filter(AccountingTransaction.property_id == property_id)
            
            transactions = query.all()
            transaction_ids = [t.id for t in transactions]
            
            # Get cash account entries
            cash_entries = db.query(JournalEntry).filter(
                JournalEntry.transaction_id.in_(transaction_ids),
                JournalEntry.account_id == cash_account.id
            ).all()
            
            # Calculate cash flows
            operating_inflows = Decimal(0)
            operating_outflows = Decimal(0)
            investing_inflows = Decimal(0)
            investing_outflows = Decimal(0)
            financing_inflows = Decimal(0)
            financing_outflows = Decimal(0)
            
            for entry in cash_entries:
                # Get the related transaction to determine category
                transaction = db.query(AccountingTransaction).filter(
                    AccountingTransaction.id == entry.transaction_id
                ).first()
                
                # Categorize cash flows (simplified - would need more logic in production)
                if "rent" in transaction.description.lower() or "payment" in transaction.description.lower():
                    # Operating activities
                    operating_inflows += entry.debit_amount
                    operating_outflows += entry.credit_amount
                elif "expense" in transaction.description.lower() or "utility" in transaction.description.lower():
                    # Operating activities
                    operating_outflows += entry.credit_amount
                elif "equipment" in transaction.description.lower() or "property" in transaction.description.lower():
                    # Investing activities
                    investing_outflows += entry.credit_amount
                elif "loan" in transaction.description.lower() or "mortgage" in transaction.description.lower():
                    # Financing activities
                    financing_inflows += entry.debit_amount
                    financing_outflows += entry.credit_amount
            
            net_operating = operating_inflows - operating_outflows
            net_investing = investing_inflows - investing_outflows
            net_financing = financing_inflows - financing_outflows
            net_change_in_cash = net_operating + net_investing + net_financing
            
            return {
                "period": {
                    "start_date": str(start_date),
                    "end_date": str(end_date)
                },
                "operating_activities": {
                    "cash_from_operations": float(operating_inflows),
                    "cash_used_in_operations": float(operating_outflows),
                    "net_cash_from_operations": float(net_operating)
                },
                "investing_activities": {
                    "cash_from_investing": float(investing_inflows),
                    "cash_used_in_investing": float(investing_outflows),
                    "net_cash_from_investing": float(net_investing)
                },
                "financing_activities": {
                    "cash_from_financing": float(financing_inflows),
                    "cash_used_in_financing": float(financing_outflows),
                    "net_cash_from_financing": float(net_financing)
                },
                "net_change_in_cash": float(net_change_in_cash)
            }
            
        except Exception as e:
            logger.error(f"Error generating cash flow statement: {str(e)}")
            return {"error": str(e)}
    
    def get_trial_balance(
        self,
        db: Session,
        property_id: Optional[int] = None,
        as_of_date: Optional[date] = None
    ) -> Dict:
        """Generate Trial Balance"""
        try:
            from ..models.accounting import Account, JournalEntry, AccountingTransaction
            
            if not as_of_date:
                as_of_date = date.today()
            
            # Get all transactions up to the date
            query = db.query(AccountingTransaction).filter(
                AccountingTransaction.date <= as_of_date
            )
            
            if property_id:
                query = query.filter(AccountingTransaction.property_id == property_id)
            
            transactions = query.all()
            transaction_ids = [t.id for t in transactions]
            
            # Get all journal entries
            journal_entries = db.query(JournalEntry).filter(
                JournalEntry.transaction_id.in_(transaction_ids)
            ).all()
            
            # Calculate balance for each account
            accounts = db.query(Account).filter(Account.is_active == True).all()
            account_balances = []
            total_debits = Decimal(0)
            total_credits = Decimal(0)
            
            for account in accounts:
                entries = [je for je in journal_entries if je.account_id == account.id]
                debit_total = sum(je.debit_amount for je in entries)
                credit_total = sum(je.credit_amount for je in entries)
                balance = debit_total - credit_total
                
                account_balances.append({
                    "account_code": account.code,
                    "account_name": account.name,
                    "account_type": account.type.value,
                    "debit": float(debit_total),
                    "credit": float(credit_total),
                    "balance": float(balance)
                })
                
                total_debits += debit_total
                total_credits += credit_total
            
            return {
                "as_of_date": str(as_of_date),
                "accounts": account_balances,
                "total_debits": float(total_debits),
                "total_credits": float(total_credits),
                "difference": float(total_debits - total_credits),  # Should be 0
                "is_balanced": abs(total_debits - total_credits) < Decimal("0.01")
            }
            
        except Exception as e:
            logger.error(f"Error generating trial balance: {str(e)}")
            return {"error": str(e)}
    
    def seed_default_chart_of_accounts(self, db: Session) -> int:
        """Create default chart of accounts"""
        try:
            from ..models.accounting import Account, AccountType
            
            default_accounts = [
                # Assets (1000-1999)
                ("1000", "ASSETS", AccountType.ASSET, None, True),
                ("1010", "Bank Account", AccountType.ASSET, 1, True),
                ("1020", "Petty Cash", AccountType.ASSET, 1, False),
                ("1100", "Accounts Receivable", AccountType.ASSET, 1, True),
                ("1200", "Security Deposits Held", AccountType.ASSET, 1, True),
                ("1300", "Prepaid Expenses", AccountType.ASSET, 1, False),
                
                # Liabilities (2000-2999)
                ("2000", "LIABILITIES", AccountType.LIABILITY, None, True),
                ("2010", "Accounts Payable", AccountType.LIABILITY, 2, True),
                ("2020", "Security Deposits Payable", AccountType.LIABILITY, 2, True),
                ("2100", "Loans Payable", AccountType.LIABILITY, 2, False),
                ("2200", "Mortgage Payable", AccountType.LIABILITY, 2, False),
                
                # Equity (3000-3999)
                ("3000", "EQUITY", AccountType.EQUITY, None, True),
                ("3010", "Owner's Capital", AccountType.EQUITY, 3, True),
                ("3020", "Retained Earnings", AccountType.EQUITY, 3, True),
                
                # Revenue (4000-4999)
                ("4000", "REVENUE", AccountType.REVENUE, None, True),
                ("4010", "Rental Income", AccountType.REVENUE, 4, True),
                ("4020", "Late Fees", AccountType.REVENUE, 4, False),
                ("4030", "Utility Reimbursements", AccountType.REVENUE, 4, False),
                ("4040", "Other Income", AccountType.REVENUE, 4, False),
                
                # Expenses (5000-5999)
                ("5000", "EXPENSES", AccountType.EXPENSE, None, True),
                ("5010", "Maintenance & Repairs", AccountType.EXPENSE, 5, True),
                ("5020", "Utilities", AccountType.EXPENSE, 5, True),
                ("5030", "Property Tax", AccountType.EXPENSE, 5, True),
                ("5040", "Insurance", AccountType.EXPENSE, 5, True),
                ("5050", "Management Fees", AccountType.EXPENSE, 5, False),
                ("5060", "Cleaning", AccountType.EXPENSE, 5, False),
                ("5070", "Landscaping", AccountType.EXPENSE, 5, False),
                ("5080", "Security", AccountType.EXPENSE, 5, False),
                ("5090", "Legal & Professional Fees", AccountType.EXPENSE, 5, False),
                ("5100", "Advertising", AccountType.EXPENSE, 5, False),
                ("5110", "Supplies", AccountType.EXPENSE, 5, False),
                ("5900", "Other Expenses", AccountType.EXPENSE, 5, False),
            ]
            
            created_count = 0
            parent_accounts = {}
            
            for code, name, acc_type, parent_code, is_system in default_accounts:
                # Check if exists
                existing = db.query(Account).filter(Account.code == code).first()
                if existing:
                    continue
                
                # Get parent ID if applicable
                parent_id = None
                if parent_code:
                    parent_id = parent_accounts.get(parent_code)
                
                account = Account(
                    code=code,
                    name=name,
                    type=acc_type,
                    parent_account_id=parent_id,
                    is_system_account=is_system,
                    is_active=True
                )
                db.add(account)
                db.flush()
                
                # Store for parent reference
                if code.endswith("000"):
                    parent_accounts[int(code[0])] = account.id
                
                created_count += 1
            
            db.commit()
            logger.info(f"Created {created_count} accounts")
            return created_count
            
        except Exception as e:
            logger.error(f"Error seeding chart of accounts: {str(e)}")
            db.rollback()
            return 0

accounting_service = AccountingService()








