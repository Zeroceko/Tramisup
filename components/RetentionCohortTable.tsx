"use client";

import { format } from "date-fns";

interface RetentionCohort {
  id: string;
  cohortDate: Date;
  usersCount: number;
  retentionDay1: number | null;
  retentionDay7: number | null;
  retentionDay30: number | null;
  retentionDay60: number | null;
  retentionDay90: number | null;
}

export default function RetentionCohortTable({ cohorts }: { cohorts: RetentionCohort[] }) {
  if (cohorts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Retention Cohorts</h2>
        <div className="text-center py-8 text-gray-500">
          <p>No cohort data available</p>
        </div>
      </div>
    );
  }

  const getColorClass = (value: number | null) => {
    if (!value) return "bg-gray-100 text-gray-400";
    if (value >= 80) return "bg-green-100 text-green-800";
    if (value >= 60) return "bg-yellow-100 text-yellow-800";
    if (value >= 40) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Retention Cohorts</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Cohort</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Users</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Day 1</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Day 7</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Day 30</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Day 60</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Day 90</th>
            </tr>
          </thead>
          <tbody>
            {cohorts.map((cohort) => (
              <tr key={cohort.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">
                  {format(new Date(cohort.cohortDate), "MMM yyyy")}
                </td>
                <td className="py-3 px-4 text-center text-gray-700">
                  {cohort.usersCount.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-block px-3 py-1 rounded ${getColorClass(cohort.retentionDay1)}`}>
                    {cohort.retentionDay1 ? `${cohort.retentionDay1}%` : "—"}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-block px-3 py-1 rounded ${getColorClass(cohort.retentionDay7)}`}>
                    {cohort.retentionDay7 ? `${cohort.retentionDay7}%` : "—"}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-block px-3 py-1 rounded ${getColorClass(cohort.retentionDay30)}`}>
                    {cohort.retentionDay30 ? `${cohort.retentionDay30}%` : "—"}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-block px-3 py-1 rounded ${getColorClass(cohort.retentionDay60)}`}>
                    {cohort.retentionDay60 ? `${cohort.retentionDay60}%` : "—"}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-block px-3 py-1 rounded ${getColorClass(cohort.retentionDay90)}`}>
                    {cohort.retentionDay90 ? `${cohort.retentionDay90}%` : "—"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
