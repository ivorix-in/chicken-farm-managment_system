import React from 'react';
import { Printer, Users, MapPin, Calendar } from 'lucide-react';
import { Batch, BatchSummary } from '../api/batchesApi';
import { DailyVisit } from '../../DailyVisits/api/dailyVisitsApi';
import { FeedTransaction } from '../../Feed/api/feedApi';

interface BatchSummaryReportProps {
  batch: Batch;
  summary: BatchSummary;
  visits: DailyVisit[];
  feedTransactions: FeedTransaction[];
}

export default function BatchSummaryReport({
  batch,
  summary,
  visits,
  feedTransactions,
}: BatchSummaryReportProps) {

  const totalMortalityPercent = ((summary.totalMortality / summary.chickCount) * 100).toFixed(2);
  const excessShortage = summary.chickCount - summary.totalMortality - summary.totalCulls - summary.totalOwnUse - summary.soldBirds - summary.currentBirdCount;
  
  // Aggregate Feed Details
  let godownQty = 0, godownBags = 0;
  let tmsInQty = 0, tmsInBags = 0;
  let returnQty = 0, returnBags = 0;
  let transferOutQty = 0, transferOutBags = 0;
  let consumptionQty = 0, consumptionBags = 0;

  feedTransactions.forEach(tx => {
    if (tx.category === 'GODOWN') {
      godownQty += tx.quantityKg;
      godownBags += tx.numberOfBags;
    } else if (tx.category === 'TMS_IN') {
      tmsInQty += tx.quantityKg;
      tmsInBags += tx.numberOfBags;
    } else if (tx.category === 'RETURN') {
      returnQty += tx.quantityKg;
      returnBags += tx.numberOfBags;
    } else if (tx.category === 'TRANSFER_OUT') {
      transferOutQty += tx.quantityKg;
      transferOutBags += tx.numberOfBags;
    } else if (tx.category === 'CONSUMPTION' || !tx.category) {
      consumptionQty += tx.quantityKg;
      consumptionBags += tx.numberOfBags;
    }
  });

  const totalReconciledFeedKg = godownQty + tmsInQty + consumptionQty - returnQty - transferOutQty;
  const fcr = summary.totalKgsSold > 0 ? (totalReconciledFeedKg / summary.totalKgsSold).toFixed(2) : '-';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 print:p-0 print:border-none print:shadow-none w-full space-y-8">
      {/* Header - Hidden on Print */}
      <div className="border-b border-gray-100 pb-4 flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Batch Performance Summary</h2>
          <p className="text-xs text-gray-400 font-normal mt-0.5">
            Flock lifecycle analytics and feed reconciliation report.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <Printer size={16} /> Print Report
        </button>
      </div>

      {/* Report Content */}
      <div className="space-y-8">
        
        {/* Title for print / inline view */}
        <div className="text-center pb-4 border-b-2 border-gray-900">
          <h1 className="text-3xl font-black uppercase tracking-wider text-gray-900">Batch Summary Report</h1>
          <p className="text-gray-500 mt-1 font-bold">Batch No: {batch.batchNo}</p>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#FAFAFA] p-5 rounded-2xl border border-gray-50 text-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600"><Users size={16} /></div>
            <div>
              <span className="block text-gray-400 text-xs font-semibold uppercase tracking-wider">Farmer Name</span>
              <span className="font-bold text-gray-800 text-sm">{typeof batch.farmId === 'object' ? (batch.farmId as any).name : '-'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm text-[#00A859]"><MapPin size={16} /></div>
            <div>
              <span className="block text-gray-400 text-xs font-semibold uppercase tracking-wider">Address / Location</span>
              <span className="font-bold text-gray-800 text-sm">{typeof batch.farmId === 'object' ? (batch.farmId as any).address : '-'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm text-purple-600"><Calendar size={16} /></div>
            <div>
              <span className="block text-gray-400 text-xs font-semibold uppercase tracking-wider">Placement Date</span>
              <span className="font-bold text-gray-800 text-sm">{new Date(batch.startDate || (batch as any).placementDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 border border-emerald-500/20 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <div>
              <span className="block text-emerald-700 text-xs font-bold uppercase tracking-wider">Feed Conversion Ratio (F.C.R)</span>
              <span className="text-3xl font-black text-emerald-700 leading-none mt-2 block">{fcr}</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-medium mt-3 block">Total feed divided by total weight sold</span>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500/5 to-blue-600/10 border border-blue-500/20 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <div>
              <span className="block text-blue-700 text-xs font-bold uppercase tracking-wider">Avg Weight</span>
              <span className="text-3xl font-black text-blue-700 leading-none mt-2 block">{summary.averageWeightKg} kg</span>
            </div>
            <span className="text-[10px] text-blue-600 font-medium mt-3 block">Based on final daily log weight</span>
          </div>

          <div className="bg-gradient-to-br from-purple-500/5 to-purple-600/10 border border-purple-500/20 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <div>
              <span className="block text-purple-700 text-xs font-bold uppercase tracking-wider">Total KGs Sold</span>
              <span className="text-3xl font-black text-purple-700 leading-none mt-2 block">{summary.totalKgsSold.toLocaleString()} kg</span>
            </div>
            <span className="text-[10px] text-purple-600 font-medium mt-3 block">Final sales weight output</span>
          </div>

          <div className="bg-[#FAFAFA] border border-gray-100 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <div>
              <span className="block text-gray-500 text-xs font-bold uppercase tracking-wider">Flock Yield (Housed vs Sold)</span>
              <span className="text-2xl font-black text-gray-800 leading-none mt-2 block">
                {summary.soldBirds.toLocaleString()} / {summary.chickCount.toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] text-gray-400 font-medium mt-3 block">
              {((summary.soldBirds / summary.chickCount) * 100).toFixed(1)}% recovery yield
            </span>
          </div>
        </div>

        {/* Production Summary Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Flock Production Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            <div className="bg-white border border-gray-100 p-4 rounded-2xl hover:shadow-sm transition-shadow">
              <span className="block text-gray-400 text-[10px] font-bold uppercase tracking-wider">Mortality</span>
              <span className="font-extrabold text-red-600 text-lg block mt-1">{summary.totalMortality.toLocaleString()}</span>
            </div>
            <div className="bg-white border border-gray-100 p-4 rounded-2xl hover:shadow-sm transition-shadow">
              <span className="block text-gray-400 text-[10px] font-bold uppercase tracking-wider">Mortality %</span>
              <span className="font-extrabold text-red-600 text-lg block mt-1">{totalMortalityPercent}%</span>
            </div>
            <div className="bg-white border border-gray-100 p-4 rounded-2xl hover:shadow-sm transition-shadow">
              <span className="block text-gray-400 text-[10px] font-bold uppercase tracking-wider">Culls</span>
              <span className="font-extrabold text-gray-700 text-lg block mt-1">{summary.totalCulls.toLocaleString()}</span>
            </div>
            <div className="bg-white border border-gray-100 p-4 rounded-2xl hover:shadow-sm transition-shadow">
              <span className="block text-gray-400 text-[10px] font-bold uppercase tracking-wider">Weak Birds</span>
              <span className="font-extrabold text-gray-700 text-lg block mt-1">{summary.totalWeakBirds.toLocaleString()}</span>
            </div>
            <div className="bg-white border border-gray-100 p-4 rounded-2xl hover:shadow-sm transition-shadow">
              <span className="block text-gray-400 text-[10px] font-bold uppercase tracking-wider">Own Use</span>
              <span className="font-extrabold text-gray-700 text-lg block mt-1">{summary.totalOwnUse.toLocaleString()}</span>
            </div>
            <div className={`p-4 rounded-2xl border text-center ${excessShortage >= 0 ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' : 'bg-red-50/50 border-red-100 text-red-800'}`}>
              <span className="block text-[10px] font-bold uppercase tracking-wider opacity-70">Shortage/Excess</span>
              <span className="font-extrabold text-lg block mt-1">
                {excessShortage > 0 ? '+' : ''}{excessShortage.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Feed Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Feed Inventory Reconciliation</h3>
          <div className="overflow-hidden border border-gray-100 rounded-2xl shadow-sm bg-white">
            <table className="w-full text-sm border-collapse text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-3.5 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Source / Category</th>
                  <th className="py-3.5 px-4 text-right font-semibold text-gray-500 text-xs uppercase tracking-wider">Quantity (Kg)</th>
                  <th className="py-3.5 px-4 text-right font-semibold text-gray-500 text-xs uppercase tracking-wider">Number of Bags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-700">Feed From Godown</td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">{godownQty.toLocaleString()} kg</td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">{godownBags.toLocaleString()}</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-700">Feed TMS In</td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">{tmsInQty.toLocaleString()} kg</td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">{tmsInBags.toLocaleString()}</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-700">Direct Consumption</td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">{consumptionQty.toLocaleString()} kg</td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">{consumptionBags.toLocaleString()}</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-700">Return Feed</td>
                  <td className="py-3 px-4 text-right font-semibold text-red-600">-{returnQty.toLocaleString()} kg</td>
                  <td className="py-3 px-4 text-right font-semibold text-red-600">-{returnBags.toLocaleString()}</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-700">Feed Transfer Out</td>
                  <td className="py-3 px-4 text-right font-semibold text-red-600">-{transferOutQty.toLocaleString()} kg</td>
                  <td className="py-3 px-4 text-right font-semibold text-red-600">-{transferOutBags.toLocaleString()}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-bold border-t border-gray-100">
                  <td className="py-4 px-4 text-gray-800 uppercase text-xs tracking-wider">Total Reconciled Feed Consumption</td>
                  <td className="py-4 px-4 text-right text-base text-emerald-600 font-extrabold">{totalReconciledFeedKg.toLocaleString()} kg</td>
                  <td className="py-4 px-4 text-right text-base text-gray-900 font-extrabold">
                    {godownBags + tmsInBags + consumptionBags - returnBags - transferOutBags} bags
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Management */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Management Remarks</h3>
          <div className="bg-[#FAFAFA] p-5 rounded-2xl border border-gray-50 min-h-[80px]">
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {(batch as any).managerRemarks || 'No remarks provided for this flock cycle.'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
