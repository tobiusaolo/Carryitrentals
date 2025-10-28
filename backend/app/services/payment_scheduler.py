"""
Scheduled Tasks for Automated Payment Monitoring
Runs background tasks to automatically update tenant payment statuses
"""

import asyncio
import logging
from datetime import datetime, time
from typing import Dict, List
import time as time_module
from threading import Thread

# Make schedule import optional to prevent startup errors
try:
    import schedule
    SCHEDULE_AVAILABLE = True
except ImportError:
    SCHEDULE_AVAILABLE = False
    schedule = None

from ..services.payment_monitor import payment_monitor

logger = logging.getLogger(__name__)

class PaymentMonitoringScheduler:
    """Scheduler for automated payment monitoring tasks"""
    
    def __init__(self):
        self.is_running = False
        self.scheduler_thread = None
    
    def start_scheduler(self):
        """Start the automated monitoring scheduler"""
        if not SCHEDULE_AVAILABLE:
            logger.error("Schedule module not available. Cannot start scheduler.")
            return False
            
        if self.is_running:
            logger.warning("Scheduler is already running")
            return False
        
        self.is_running = True
        
        # Schedule tasks
        self._schedule_tasks()
        
        # Start scheduler in background thread
        self.scheduler_thread = Thread(target=self._run_scheduler, daemon=True)
        self.scheduler_thread.start()
        
        logger.info("Payment monitoring scheduler started")
        return True
    
    def stop_scheduler(self):
        """Stop the automated monitoring scheduler"""
        self.is_running = False
        if self.scheduler_thread:
            self.scheduler_thread.join(timeout=5)
        logger.info("Payment monitoring scheduler stopped")
    
    def _schedule_tasks(self):
        """Schedule all automated monitoring tasks"""
        if not SCHEDULE_AVAILABLE:
            logger.error("Schedule module not available. Cannot schedule tasks.")
            return
        
        # Daily payment status check at 9:00 AM
        schedule.every().day.at("09:00").do(self._run_daily_payment_check)
        
        # Weekly comprehensive check on Mondays at 8:00 AM
        schedule.every().monday.at("08:00").do(self._run_weekly_comprehensive_check)
        
        # Monthly report generation - runs every 30 days
        schedule.every(30).days.at("10:00").do(self._run_monthly_report)
        
        logger.info("Scheduled tasks configured:")
        logger.info("- Daily payment check: 9:00 AM")
        logger.info("- Weekly comprehensive check: Monday 8:00 AM")
        logger.info("- Monthly report: Every 30 days at 10:00 AM")
    
    def _run_scheduler(self):
        """Main scheduler loop"""
        if not SCHEDULE_AVAILABLE:
            logger.error("Schedule module not available. Cannot run scheduler.")
            return
            
        while self.is_running:
            try:
                schedule.run_pending()
                time_module.sleep(60)  # Check every minute
            except Exception as e:
                logger.error(f"Error in scheduler loop: {str(e)}")
                time_module.sleep(60)
    
    def _run_daily_payment_check(self):
        """Run daily payment status check"""
        try:
            logger.info("Running daily payment status check...")
            
            result = payment_monitor.run_automated_payment_monitoring()
            
            # Log summary
            logger.info(f"Daily check completed:")
            logger.info(f"- Overdue updated: {result.get('overdue_updated', 0)}")
            logger.info(f"- Due updated: {result.get('due_updated', 0)}")
            logger.info(f"- Pending updated: {result.get('pending_updated', 0)}")
            logger.info(f"- Moved out updated: {result.get('moved_out_updated', 0)}")
            logger.info(f"- Total processed: {result.get('total_processed', 0)}")
            
            if result.get('errors'):
                logger.warning(f"Errors encountered: {result['errors']}")
            
        except Exception as e:
            logger.error(f"Error in daily payment check: {str(e)}")
    
    def _run_weekly_comprehensive_check(self):
        """Run weekly comprehensive check"""
        try:
            logger.info("Running weekly comprehensive payment check...")
            
            # Get detailed summary
            summary = payment_monitor.get_payment_summary()
            
            logger.info(f"Weekly comprehensive check completed:")
            logger.info(f"- Total tenants: {summary.get('total_tenants', 0)}")
            logger.info(f"- Overdue: {summary.get('overdue_count', 0)} (${summary.get('total_overdue_amount', 0):.2f})")
            logger.info(f"- Due: {summary.get('due_count', 0)} (${summary.get('total_due_amount', 0):.2f})")
            logger.info(f"- Pending: {summary.get('pending_count', 0)} (${summary.get('total_pending_amount', 0):.2f})")
            logger.info(f"- Paid: {summary.get('paid_count', 0)}")
            logger.info(f"- Moved out: {summary.get('moved_out_count', 0)}")
            
            # Run automated monitoring
            self._run_daily_payment_check()
            
        except Exception as e:
            logger.error(f"Error in weekly comprehensive check: {str(e)}")
    
    def _run_monthly_report(self):
        """Run monthly report generation"""
        try:
            logger.info("Generating monthly payment report...")
            
            # Get comprehensive data
            categories = payment_monitor.get_tenant_categories()
            summary = payment_monitor.get_payment_summary()
            
            # Generate report data
            report = {
                "month": datetime.now().strftime("%B %Y"),
                "generated_at": datetime.now().isoformat(),
                "summary": summary,
                "categories": categories,
                "recommendations": self._generate_recommendations(summary)
            }
            
            logger.info(f"Monthly report generated for {report['month']}")
            logger.info(f"Key metrics:")
            logger.info(f"- Total revenue potential: ${summary.get('total_overdue_amount', 0) + summary.get('total_due_amount', 0) + summary.get('total_pending_amount', 0):.2f}")
            logger.info(f"- Collection rate: {self._calculate_collection_rate(summary):.1f}%")
            
        except Exception as e:
            logger.error(f"Error generating monthly report: {str(e)}")
    
    def _generate_recommendations(self, summary: Dict) -> List[str]:
        """Generate recommendations based on payment summary"""
        recommendations = []
        
        overdue_count = summary.get('overdue_count', 0)
        due_count = summary.get('due_count', 0)
        total_tenants = summary.get('total_tenants', 0)
        
        if overdue_count > 0:
            overdue_percentage = (overdue_count / total_tenants) * 100 if total_tenants > 0 else 0
            if overdue_percentage > 20:
                recommendations.append("High overdue rate detected. Consider implementing stricter payment policies.")
            elif overdue_percentage > 10:
                recommendations.append("Moderate overdue rate. Follow up with overdue tenants.")
        
        if due_count > 0:
            recommendations.append(f"{due_count} tenants have payments due soon. Send payment reminders.")
        
        if total_tenants > 0:
            collection_rate = self._calculate_collection_rate(summary)
            if collection_rate < 80:
                recommendations.append("Collection rate is below 80%. Review payment processes.")
            elif collection_rate > 95:
                recommendations.append("Excellent collection rate! Consider offering payment incentives.")
        
        return recommendations
    
    def _calculate_collection_rate(self, summary: Dict) -> float:
        """Calculate payment collection rate"""
        total_tenants = summary.get('total_tenants', 0)
        paid_count = summary.get('paid_count', 0)
        
        if total_tenants == 0:
            return 0.0
        
        return (paid_count / total_tenants) * 100
    
    def run_manual_check(self) -> Dict:
        """Run manual payment check (for testing or immediate execution)"""
        try:
            logger.info("Running manual payment check...")
            result = payment_monitor.run_automated_payment_monitoring()
            logger.info(f"Manual check completed: {result}")
            return result
        except Exception as e:
            logger.error(f"Error in manual check: {str(e)}")
            return {"error": str(e)}

# Global scheduler instance
payment_scheduler = PaymentMonitoringScheduler()
