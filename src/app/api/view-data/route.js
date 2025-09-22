// 'use client'

import { getConnection, sql } from '../../../lib/database';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {

    const searchParams = request.nextUrl.searchParams;
    const timePeriod = searchParams.get('timePeriod');
    const item = searchParams.get('item');
    const countType = searchParams.get('countType');
    const customer = searchParams.get('customer');

    let countTypeClause = countType == 'count' || !countType
      ? "count(*)" // "count(DISTINCT([Cust#]))" // "count(DISTINCT([Parent Cust]))"
      : "sum(dbo.[NKH Orders CY 4 yr].QtytoShip)"
    
    let timePeriodClause = timePeriod == "quarterly" ? "CONCAT(OrdYear, '-', OrdQtr)" : "OrdYear";

    let selectClause = "SELECT " + timePeriodClause + " as \"time\", " + countTypeClause + " as \"count\" ";

    if (customer && customer != 'null') {
      selectClause = selectClause + ", dbo.[NKH Orders CY 4 yr].[Parent Cust] as Customer ";
    } 

    let fromClause = "FROM  dbo.[NKH Orders CY 4 yr] ";
    let innerjoinClause = "INNER JOIN dbo.OCRD ON dbo.[NKH Orders CY 4 yr].[Parent Cust] = dbo.OCRD.CardCode";

    let whereItemClause = item && item != '' && item != 'null' ? "dbo.[NKH Orders CY 4 yr].NKHItem = '" + item + "'" : null;

    // Convert comma-delimited customers to an "IN" clause
    const customerInClause = customer && customer != '' && customer != 'null'
      ? customer.split(',').map(item => `'${item}'`).join(',') : null;

    let whereCustomerClause = customerInClause && customerInClause != 'null' ? "dbo.[NKH Orders CY 4 yr].[Parent Cust] in (" + customerInClause + ")" : null;

    let whereClause =
      whereItemClause && whereCustomerClause ?  "WHERE " + whereItemClause + " AND " + whereCustomerClause :
        whereItemClause ?  "WHERE " + whereItemClause :
        whereCustomerClause ?  "WHERE " + whereCustomerClause :
        "";

    let groupByClause = "GROUP BY " + timePeriodClause;
    if (customer && customer != 'null') {
      groupByClause = groupByClause + ", dbo.[NKH Orders CY 4 yr].[Parent Cust] "
    }

    let orderByClause = "ORDER BY " + timePeriodClause;

    const query = selectClause + " "
      + fromClause + " " 
      + innerjoinClause + " "
      + whereClause + " "
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