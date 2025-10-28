"""
PDF Report Generation Service
Generates professional PDF reports and statements
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from io import BytesIO
from typing import Dict, List, Optional
from datetime import date, datetime
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

class PDFGenerator:
    """Service to generate PDF reports and statements"""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.setup_custom_styles()
    
    def setup_custom_styles(self):
        """Setup custom paragraph styles"""
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1976d2'),
            spaceAfter=30,
            alignment=TA_CENTER
        ))
        
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#424242'),
            spaceAfter=12,
            spaceBefore=12
        ))
    
    def generate_tenant_statement(
        self,
        tenant_data: Dict,
        payments: List[Dict],
        month: int,
        year: int
    ) -> BytesIO:
        """Generate monthly rent statement for tenant"""
        try:
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            story = []
            
            # Title
            title = Paragraph(f"RENT STATEMENT", self.styles['CustomTitle'])
            story.append(title)
            story.append(Spacer(1, 0.2*inch))
            
            # Statement period
            period = Paragraph(
                f"<b>Period:</b> {date(year, month, 1).strftime('%B %Y')}",
                self.styles['Normal']
            )
            story.append(period)
            story.append(Spacer(1, 0.3*inch))
            
            # Tenant information
            tenant_info = [
                ['Tenant Information', ''],
                ['Name:', f"{tenant_data['first_name']} {tenant_data['last_name']}"],
                ['Unit:', tenant_data.get('unit_number', 'N/A')],
                ['Property:', tenant_data.get('property_name', 'N/A')],
                ['Email:', tenant_data.get('email', 'N/A')],
                ['Phone:', tenant_data.get('phone', 'N/A')],
            ]
            
            tenant_table = Table(tenant_info, colWidths=[2*inch, 4*inch])
            tenant_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1976d2')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ]))
            
            story.append(tenant_table)
            story.append(Spacer(1, 0.4*inch))
            
            # Charges
            story.append(Paragraph("CHARGES", self.styles['SectionHeader']))
            
            charges_data = [
                ['Description', 'Amount'],
                ['Monthly Rent', f"${tenant_data.get('monthly_rent', 0):.2f}"],
            ]
            
            # Add utilities if any
            if tenant_data.get('utilities'):
                for utility in tenant_data['utilities']:
                    charges_data.append([
                        f"{utility['type']} Utility",
                        f"${utility['amount']:.2f}"
                    ])
            
            # Total charges
            total_charges = Decimal(str(tenant_data.get('monthly_rent', 0)))
            if tenant_data.get('utilities'):
                total_charges += sum(Decimal(str(u['amount'])) for u in tenant_data['utilities'])
            
            charges_data.append(['TOTAL CHARGES', f"${total_charges:.2f}"])
            
            charges_table = Table(charges_data, colWidths=[4*inch, 2*inch])
            charges_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e3f2fd')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#f5f5f5')),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ]))
            
            story.append(charges_table)
            story.append(Spacer(1, 0.4*inch))
            
            # Payments
            story.append(Paragraph("PAYMENTS RECEIVED", self.styles['SectionHeader']))
            
            payments_data = [['Date', 'Method', 'Reference', 'Amount']]
            
            total_paid = Decimal(0)
            for payment in payments:
                payments_data.append([
                    payment.get('date', 'N/A'),
                    payment.get('method', 'N/A'),
                    payment.get('reference', 'N/A'),
                    f"${payment.get('amount', 0):.2f}"
                ])
                total_paid += Decimal(str(payment.get('amount', 0)))
            
            if not payments or len(payments) == 0:
                payments_data.append(['No payments received this month', '', '', '$0.00'])
            else:
                payments_data.append(['TOTAL PAID', '', '', f"${total_paid:.2f}"])
            
            payments_table = Table(payments_data, colWidths=[1.5*inch, 1.5*inch, 2*inch, 1*inch])
            payments_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e3f2fd')),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('ALIGN', (3, 0), (3, -1), 'RIGHT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#f5f5f5')),
            ]))
            
            story.append(payments_table)
            story.append(Spacer(1, 0.4*inch))
            
            # Balance
            balance = total_charges - total_paid
            balance_color = colors.red if balance > 0 else colors.green
            
            balance_data = [
                ['Total Charges:', f"${total_charges:.2f}"],
                ['Total Paid:', f"${total_paid:.2f}"],
                ['BALANCE DUE:', f"${balance:.2f}"],
            ]
            
            balance_table = Table(balance_data, colWidths=[4*inch, 2*inch])
            balance_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, -1), (-1, -1), 14),
                ('TEXTCOLOR', (1, -1), (1, -1), balance_color),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ]))
            
            story.append(balance_table)
            story.append(Spacer(1, 0.5*inch))
            
            # Footer
            footer = Paragraph(
                f"<i>Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</i>",
                self.styles['Normal']
            )
            story.append(footer)
            
            # Build PDF
            doc.build(story)
            buffer.seek(0)
            
            logger.info(f"Generated tenant statement for {tenant_data.get('first_name')} {tenant_data.get('last_name')}")
            return buffer
            
        except Exception as e:
            logger.error(f"Error generating tenant statement: {str(e)}")
            raise
    
    def generate_property_report(
        self,
        property_data: Dict,
        financial_data: Dict,
        start_date: date,
        end_date: date
    ) -> BytesIO:
        """Generate comprehensive property performance report"""
        try:
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            story = []
            
            # Title
            title = Paragraph(f"PROPERTY PERFORMANCE REPORT", self.styles['CustomTitle'])
            story.append(title)
            story.append(Spacer(1, 0.2*inch))
            
            # Property info
            property_info = Paragraph(
                f"<b>{property_data['name']}</b><br/>{property_data['address']}<br/>"
                f"Period: {start_date.strftime('%B %d, %Y')} to {end_date.strftime('%B %d, %Y')}",
                self.styles['Normal']
            )
            story.append(property_info)
            story.append(Spacer(1, 0.3*inch))
            
            # Key Metrics
            story.append(Paragraph("KEY METRICS", self.styles['SectionHeader']))
            
            metrics_data = [
                ['Metric', 'Value'],
                ['Total Units', str(property_data.get('total_units', 0))],
                ['Occupied Units', str(financial_data.get('occupied_units', 0))],
                ['Occupancy Rate', f"{financial_data.get('occupancy_rate', 0):.1f}%"],
                ['Total Revenue', f"${financial_data.get('total_revenue', 0):,.2f}"],
                ['Total Expenses', f"${financial_data.get('total_expenses', 0):,.2f}"],
                ['Net Income', f"${financial_data.get('net_income', 0):,.2f}"],
                ['Profit Margin', f"{financial_data.get('profit_margin', 0):.1f}%"],
            ]
            
            metrics_table = Table(metrics_data, colWidths=[4*inch, 2*inch])
            metrics_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1976d2')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')]),
            ]))
            
            story.append(metrics_table)
            story.append(Spacer(1, 0.5*inch))
            
            # Build PDF
            doc.build(story)
            buffer.seek(0)
            
            return buffer
            
        except Exception as e:
            logger.error(f"Error generating property report: {str(e)}")
            raise
    
    def generate_year_end_report(
        self,
        owner_data: Dict,
        properties_data: List[Dict],
        financial_summary: Dict,
        year: int
    ) -> BytesIO:
        """Generate comprehensive year-end report for owner"""
        try:
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            story = []
            
            # Title
            title = Paragraph(f"YEAR-END REPORT {year}", self.styles['CustomTitle'])
            story.append(title)
            story.append(Spacer(1, 0.2*inch))
            
            # Owner info
            owner_info = Paragraph(
                f"<b>Owner:</b> {owner_data['name']}<br/>"
                f"<b>Email:</b> {owner_data['email']}<br/>"
                f"<b>Report Generated:</b> {datetime.now().strftime('%B %d, %Y')}",
                self.styles['Normal']
            )
            story.append(owner_info)
            story.append(Spacer(1, 0.3*inch))
            
            # Portfolio Summary
            story.append(Paragraph("PORTFOLIO SUMMARY", self.styles['SectionHeader']))
            
            summary_data = [
                ['Metric', 'Value'],
                ['Total Properties', str(len(properties_data))],
                ['Total Units', str(sum(p.get('total_units', 0) for p in properties_data))],
                ['Total Annual Revenue', f"${financial_summary.get('total_revenue', 0):,.2f}"],
                ['Total Annual Expenses', f"${financial_summary.get('total_expenses', 0):,.2f}"],
                ['Net Annual Income', f"${financial_summary.get('net_income', 0):,.2f}"],
                ['Average Occupancy Rate', f"{financial_summary.get('avg_occupancy', 0):.1f}%"],
                ['ROI', f"{financial_summary.get('roi', 0):.2f}%"],
            ]
            
            summary_table = Table(summary_data, colWidths=[4*inch, 2*inch])
            summary_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1976d2')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ]))
            
            story.append(summary_table)
            story.append(Spacer(1, 0.4*inch))
            
            # Property breakdown
            story.append(Paragraph("PROPERTY BREAKDOWN", self.styles['SectionHeader']))
            
            property_breakdown = [['Property', 'Units', 'Revenue', 'Expenses', 'Net Income']]
            for prop in properties_data:
                property_breakdown.append([
                    prop['name'],
                    str(prop.get('total_units', 0)),
                    f"${prop.get('revenue', 0):,.2f}",
                    f"${prop.get('expenses', 0):,.2f}",
                    f"${prop.get('net_income', 0):,.2f}"
                ])
            
            prop_table = Table(property_breakdown, colWidths=[2*inch, 0.8*inch, 1.2*inch, 1.2*inch, 1.2*inch])
            prop_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e3f2fd')),
                ('ALIGN', (0, 0), (0, -1), 'LEFT'),
                ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ]))
            
            story.append(prop_table)
            
            # Build PDF
            doc.build(story)
            buffer.seek(0)
            
            return buffer
            
        except Exception as e:
            logger.error(f"Error generating year-end report: {str(e)}")
            raise
    
    def generate_tax_report(
        self,
        property_data: Dict,
        income_data: Dict,
        expense_data: Dict,
        year: int
    ) -> BytesIO:
        """Generate tax report for property"""
        try:
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            story = []
            
            # Title
            title = Paragraph(f"TAX REPORT {year}", self.styles['CustomTitle'])
            story.append(title)
            story.append(Spacer(1, 0.2*inch))
            
            # Property info
            prop_info = Paragraph(
                f"<b>Property:</b> {property_data['name']}<br/>"
                f"<b>Address:</b> {property_data['address']}<br/>"
                f"<b>Tax Year:</b> {year}",
                self.styles['Normal']
            )
            story.append(prop_info)
            story.append(Spacer(1, 0.3*inch))
            
            # Income section
            story.append(Paragraph("RENTAL INCOME", self.styles['SectionHeader']))
            
            income_items = [['Category', 'Amount']]
            for category, amount in income_data.items():
                income_items.append([category, f"${amount:,.2f}"])
            income_items.append(['TOTAL INCOME', f"${sum(income_data.values()):,.2f}"])
            
            income_table = Table(income_items, colWidths=[4*inch, 2*inch])
            income_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e8f5e9')),
                ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ]))
            
            story.append(income_table)
            story.append(Spacer(1, 0.3*inch))
            
            # Deductible expenses
            story.append(Paragraph("DEDUCTIBLE EXPENSES", self.styles['SectionHeader']))
            
            expense_items = [['Category', 'Amount']]
            for category, amount in expense_data.items():
                expense_items.append([category, f"${amount:,.2f}"])
            expense_items.append(['TOTAL DEDUCTIBLE EXPENSES', f"${sum(expense_data.values()):,.2f}"])
            
            expense_table = Table(expense_items, colWidths=[4*inch, 2*inch])
            expense_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ffebee')),
                ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ]))
            
            story.append(expense_table)
            story.append(Spacer(1, 0.3*inch))
            
            # Taxable income
            total_income = sum(income_data.values())
            total_expenses = sum(expense_data.values())
            taxable_income = total_income - total_expenses
            
            story.append(Paragraph("TAX CALCULATION", self.styles['SectionHeader']))
            
            tax_data = [
                ['Total Income', f"${total_income:,.2f}"],
                ['Less: Deductible Expenses', f"${total_expenses:,.2f}"],
                ['TAXABLE INCOME', f"${taxable_income:,.2f}"],
            ]
            
            tax_table = Table(tax_data, colWidths=[4*inch, 2*inch])
            tax_table.setStyle(TableStyle([
                ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, -1), (-1, -1), 12),
                ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#fff9c4')),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ]))
            
            story.append(tax_table)
            story.append(Spacer(1, 0.3*inch))
            
            # Disclaimer
            disclaimer = Paragraph(
                "<i>Note: This report is for informational purposes only. "
                "Please consult with a tax professional for official tax preparation.</i>",
                self.styles['Normal']
            )
            story.append(disclaimer)
            
            # Build PDF
            doc.build(story)
            buffer.seek(0)
            
            return buffer
            
        except Exception as e:
            logger.error(f"Error generating tax report: {str(e)}")
            raise

pdf_generator = PDFGenerator()








