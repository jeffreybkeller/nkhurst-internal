// 'use client'

import { getConnection, sql } from '../../../../lib/database';
import { NextResponse } from 'next/server';

async function selectForTimeFrame(weeks, years) {

    // If needed, we can use the date utils to use the previous week as the start (Sun-Sat) 

    let time_frame = `${weeks} Weeks`;

    switch (weeks) {
        case 26 || -26 :
            time_frame = "Half Year";
            break;
        case 13 || -13 :
            time_frame = "Quarter";
            break;
        case 4 || -4 :
            time_frame = "4 Weeks";
            break;
        default:
            break;
    }

    const selectStatement = "SELECT " + `FORMAT(DATEADD(year, ${years}, DATEADD(week, ${weeks}, GETDATE())), 'yyyy-MM-dd') as start_date, `
        + "SUM(QtytoShip) AS qty, COUNT(*) AS count, "
        + `'${time_frame}' as period_length `
        + "FROM dbo.[NKH Orders CY 4 yr] "
        + "WHERE OrderDate >= " + `DATEADD(year, ${years}, DATEADD(week, ${weeks}, GETDATE())) `
        + `AND OrderDate < DATEADD(year, ${years}, GETDATE()) `
    return selectStatement;

}

export async function GET(request) {

    try {

        async function buildQuery(years) {

            const query =

                `WITH period_one AS (${await selectForTimeFrame(-52, `${years}`)}), `
                + ` period_two AS (${await selectForTimeFrame(-26, `${years}`)}), `
                + ` period_three AS (${await selectForTimeFrame(-13, `${years}`)}), `
                + ` period_four AS (${await selectForTimeFrame(-4, `${years}`)}) `

                + "SELECT "

                + "p1.period_length, "
                + "p2.period_length, "
                + "p3.period_length, "
                + "p4.period_length, "

                + "p1.start_date, "
                + "p2.start_date, "
                + "p3.start_date, "
                + "p4.start_date, "

                + "p1.qty, "
                + "p2.qty, "
                + "p3.qty, "
                + "p4.qty, "

                + "p1.count, "
                + "p2.count, "
                + "p3.count, "
                + "p4.count "

                + "FROM period_one p1 "
                + "CROSS JOIN period_two p2 "
                + "CROSS JOIN period_three p3 "
                + "CROSS JOIN period_four p4 ";

            return query;
        }

        const pool = await getConnection();

        let data = { sets: [] };

        for (let i = -3; i <= 0; i++) {
            const query = await buildQuery(i); 
            const result = await pool.request().query(query);
            data.sets.push( result.recordsets[0][0]);
        }

        return NextResponse.json({
            success: true,
            data: data,
            count: 0
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