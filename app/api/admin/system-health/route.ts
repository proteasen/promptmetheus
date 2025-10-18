import { requireAdmin } from "@/lib/admin"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/supabase"

export const dynamic = "force-dynamic"

type DatabaseStatus = {
  status: 'connected' | 'degraded' | 'unavailable'
  responseTime: number
  version?: string
  error?: string
}

type SystemHealth = {
  status: 'healthy' | 'degraded' | 'unhealthy'
  uptime: number
  memory: {
    heapUsed: number
    heapTotal: number
    rss: number
    external: number
    arrayBuffers: number
  }
  database: DatabaseStatus
  timestamp: string
  nodeVersion: string
  region: string | string[] | undefined
  metrics: {
    responseTime: number
  }
}

export async function GET() {
  const startTime = process.hrtime()
  let databaseStatus: SystemHealth['database'] = {
    status: 'unavailable',
    responseTime: 0
  }

  try {
    await requireAdmin()

    // Check database health
    try {
      const dbStartTime = process.hrtime()
      const supabase = await createClient()
      
      // Test database connection with a simple query
      const { data, error } = await supabase
        .from('chats')
        .select('count(*)')
        .single()
      
      const dbEndTime = process.hrtime(dbStartTime)
      const dbResponseTime = dbEndTime[0] * 1000 + dbEndTime[1] / 1000000 // Convert to ms
      
      databaseStatus = {
        status: error ? 'degraded' : 'connected',
        responseTime: Math.round(dbResponseTime * 100) / 100, // Round to 2 decimal places
        version: process.env.POSTGRES_VERSION
      }
    } catch (dbError) {
      console.error("Database health check failed:", dbError)
      databaseStatus = {
        ...databaseStatus,
        status: 'unavailable',
        error: 'Failed to connect to database'
      }
    }

    // Calculate overall status
    const status: SystemHealth['status'] = 
      databaseStatus.status === 'connected' ? 'healthy' :
      databaseStatus.status === 'degraded' ? 'degraded' : 'unhealthy'

    // Get memory usage
    const memoryUsage = process.memoryUsage()
    const memory = {
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100, // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100, // MB
      rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100, // MB
      external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100, // MB
      arrayBuffers: Math.round(memoryUsage.arrayBuffers / 1024 / 1024 * 100) / 100 // MB
    }

    // Calculate total response time
    const endTime = process.hrtime(startTime)
    const responseTime = endTime[0] * 1000 + endTime[1] / 1000000 // Convert to ms

    const systemHealth: SystemHealth = {
      status,
      uptime: Math.floor(process.uptime()),
      memory,
      database: databaseStatus,
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      region: process.env.VERCEL_REGION || process.env.NOW_REGION,
      metrics: {
        responseTime: Math.round(responseTime * 100) / 100 // Round to 2 decimal places
      }
    }

    return NextResponse.json(systemHealth)
  } catch (error) {
    console.error("Error in system health check:", error)
    
    // Return minimal health info even in case of error
    const endTime = process.hrtime(startTime)
    const responseTime = endTime[0] * 1000 + endTime[1] / 1000000 // Convert to ms
    
    const errorResponse = {
      status: 'unhealthy' as const,
      uptime: Math.floor(process.uptime()),
      error: 'Failed to complete health check',
      timestamp: new Date().toISOString(),
      metrics: {
        responseTime: Math.round(responseTime * 100) / 100
      }
    }
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
