"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface DashboardData {
  metrics: {
    totalUsers: number
    totalDevices: number
    totalClaims: number
    totalGrievances: number
    totalBookings: number
  }
  claimsByStatus: Array<{ status: string; count: number }>
  grievancesByStatus: Array<{ status: string; count: number }>
  recentClaims: Array<any>
}

export function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/analytics/dashboard")
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>
  }

  if (!data) {
    return <div className="text-center py-8 text-red-600">Failed to load dashboard data</div>
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Total Users" value={data.metrics.totalUsers} color="bg-blue-500" />
        <MetricCard label="Total Devices" value={data.metrics.totalDevices} color="bg-green-500" />
        <MetricCard label="Warranty Claims" value={data.metrics.totalClaims} color="bg-yellow-500" />
        <MetricCard label="Grievances" value={data.metrics.totalGrievances} color="bg-red-500" />
        <MetricCard label="Repair Bookings" value={data.metrics.totalBookings} color="bg-purple-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Claims by Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Claims by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.claimsByStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Grievances by Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Grievances by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.grievancesByStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Claims */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Claims</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Claim ID</th>
                <th className="px-4 py-2 text-left">Device</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentClaims.map((claim) => (
                <tr key={claim.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-xs">{claim.id.slice(0, 8)}</td>
                  <td className="px-4 py-2">{claim.device_model || "N/A"}</td>
                  <td className="px-4 py-2">{claim.claim_type}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        claim.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : claim.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {claim.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{new Date(claim.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className={`${color} text-white rounded-lg p-3 w-12 h-12 flex items-center justify-center mb-4`}>
        <span className="text-xl font-bold">{value > 999 ? (value / 1000).toFixed(1) + "k" : value}</span>
      </div>
      <p className="text-gray-600 text-sm">{label}</p>
    </div>
  )
}
