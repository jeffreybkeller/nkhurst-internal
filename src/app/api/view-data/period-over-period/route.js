// 'use client'

import { getConnection, sql } from '../../../../lib/database';
import { NextResponse } from 'next/server';

async function selectForTimeFrame(weeks, years) {

    const selectStatement = "SELECT " + `FORMAT(DATEADD(year, ${years}, DATEADD(week, ${weeks}, GETDATE())), 'yyyy-MM-dd') as start_date, `
        + "SUM(QtytoShip) AS qty, COUNT(*) AS count "
        + "FROM dbo.[NKH Orders CY 4 yr] "
        + "WHERE OrderDate >= " + `DATEADD(year, ${years}, DATEADD(week, ${weeks}, GETDATE())) `
        + `AND OrderDate < DATEADD(year, ${years}, GETDATE()) `
    return selectStatement;

}


export async function GET(request) {
  try {

    const query = `WITH current_period AS (${await selectForTimeFrame(-4, 0)}), `
        + ` prior_year_one AS (${await selectForTimeFrame(-4, -1)}), `
        + ` prior_year_two AS (${await selectForTimeFrame(-4, -2)}), `
        + ` prior_year_three AS (${await selectForTimeFrame(-4, -3)}), `
        + ` prior_year_four AS (${await selectForTimeFrame(-4, -4)}) `
        + "SELECT "
        + "cp.start_date, "
        + "pp.start_date, "
        + "pp2.start_date, "
        + "pp3.start_date, "
        + "pp4.start_date, "
        + "cp.qty, "
        + "pp.qty, "
        + "pp2.qty, "
        + "pp3.qty, "
        + "pp4.qty, "
        + "cp.count, "
        + "pp.count, "
        + "pp2.count, "
        + "pp3.count, "
        + "pp4.count "
        + "FROM current_period cp "
        + "CROSS JOIN prior_year_one pp "
        + "CROSS JOIN prior_year_two pp2 "
        + "CROSS JOIN prior_year_three pp3 "
        + "CROSS JOIN prior_year_four pp4 ";

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