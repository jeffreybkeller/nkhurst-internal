// 'use client'

import { getConnection, sql } from '../../../lib/database';
import { NextResponse } from 'next/server';

export async function GET(request) {
  
  try {

    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q');
    const page = searchParams.get('page');
    const per_page = searchParams.get('per_page');

    let selectClause = "SELECT dbo.OCRD.CardCode as CustNumber, dbo.OCRD.CardName as CustName ";
    let fromClause = "FROM dbo.[NKH Orders CY 4 yr]";
    let innerjoinClause = "INNER JOIN dbo.OCRD ON dbo.[NKH Orders CY 4 yr].[Parent Cust] = dbo.OCRD.CardCode";

    let whereClause = q ? "WHERE dbo.OCRD.CardName like '%" + q + "%' OR dbo.OCRD.CardCode like '%" + q + "%'" : "";
    let groupByClause = "GROUP BY dbo.OCRD.CardCode, dbo.OCRD.CardName";
    let orderByClause = "ORDER BY dbo.OCRD.CardName ";
    let rowsToReturnClause = "OFFSET 0 rows FETCH NEXT 100 ROWS ONLY";

    const query = selectClause + " "
      + fromClause + " " 
      + innerjoinClause + " "
      + whereClause + " "
      + groupByClause + " "
      + orderByClause + " "
      + rowsToReturnClause;

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