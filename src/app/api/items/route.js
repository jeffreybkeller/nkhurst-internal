// 'use client'

import { getConnection, sql } from '../../../lib/database';
import { NextResponse } from 'next/server';

export async function GET(request) {
  
  try {

    let selectClause = "SELECT dbo.[NKH Orders CY 4 yr].NKHItem as ItemId, dbo.[NKH Orders CY 4 yr].Dscription as Description";
    let fromClause = "FROM dbo.[NKH Orders CY 4 yr]";
    let innerjoinClause = "INNER JOIN dbo.OCRD ON dbo.[NKH Orders CY 4 yr].[Parent Cust] = dbo.OCRD.CardCode";
    let groupByClause = "GROUP BY dbo.[NKH Orders CY 4 yr].NKHItem, dbo.[NKH Orders CY 4 yr].Dscription";
    let orderByClause = "ORDER BY dbo.[NKH Orders CY 4 yr].NKHItem, dbo.[NKH Orders CY 4 yr].Dscription"

    const query = selectClause + " "
      + fromClause + " " 
      + innerjoinClause + " "
      + groupByClause + " "
      + orderByClause;

    const pool = await getConnection();
    const result = await pool.request().query(query);

    return NextResponse.json({
      success: true,
      data: result.recordset,
      count: result.recordset.length
    });
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Database query failed',
        error: error.message
      },
      { status: 500 }
    );
  }
}