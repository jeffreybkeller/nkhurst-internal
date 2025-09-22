'use client'

import { useState, useEffect, Suspense, use, SetStateAction } from 'react';
import { Chart, ReactGoogleChartEvent } from "react-google-charts";
import {CustomerTypeahead, Customer } from "./components/CustomerTypeahead";

export default function Home() {

  const [chartdata, setChartData] = useState<any[][] | null>(null); // useState<any[]>([]); // useState<any[][] | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedValue, setSelectedValue] = useState('');
  const [selectedCountValue, setSelectedCountValue] = useState('');

  const [selectedItemValue, setSelectedItemValue] = useState('');
  const [selectedItemOptions, setSelectedItemOptions] = useState<any[]>([]);

  const [selectedCustomersValue, setSelectedCustomersValue] = useState<string | null>(null);
  const [selectedCustomersOptions, setSelectedCustomersOptions] = useState<any[]>([]);

  const [chartReady, setChartReady] = useState(false);

  const handleChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    setSelectedValue(event.target.value);
  };

  const handleCountChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    setSelectedCountValue(event.target.value);
  };

  const handleItemChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    setSelectedItemValue(event.target.value);
  };

  const handleCustomerChange = (customer: Customer[] | null) => {
    const customersString = customer ? customer.map(user => user.CustNumber).join(",") :  null;
    setSelectedCustomersValue(customersString);
  };

  const options = {
    hAxis: {
      title: 'Time Period', // Sets the title of the axis
      format: '0',
      textStyle: {
        // Styles for the axis labels
        fontSize: 12,
        fontName: 'Arial',
        color: '#000000ff',
      },
      gridlines: {
        color: 'none'
      }
    },
    vAxis: {
      minValue: 0,
    //  format: '#'
    },
    chartArea: {
      bottom: 72,
      top: 30,
      width: "70%"
    },
  //  legend: { position: 'none' }
  };

  async function fetchData(timePeriod: any, item: any, countType: any, customer: any) {
    try {

      const dataURL = "/api/view-data?timePeriod=" + timePeriod + "&item=" + item
        + "&countType=" + countType + "&customer=" + customer;
      const response = await fetch(dataURL);
      const result = await response.json();
      
      if (result.success) {

        let chartD = [];

        // If there is only one customer selected, build the Google Charts data
        if (!customer || customer.split(',').length == 1) {

          chartD.push(["Period", "Total",
            {
              role: "annotation",
              type: "string",
            }]);

          for (const row of result.data) {
            try {
              chartD.push([row["time"], row.count, row.count])
            } catch (e) {
              console.log(e)
            }
          }

        } else { // There are multiple customers selected, build the Google Charts data arrays

          interface dataRow {
            bucket: string,
            attr1: number,
            attr2: number
          }
          let tempArray: dataRow[];
          tempArray = [];

          let attrArray: string[] = [];

          // Build attribute array
          for (const row of result.data) {
            // If the customer doesn't exist, add them
            if (!attrArray.find((item) => item === row.Customer)) {
              attrArray.push(row.Customer)
            }
          }

          let chartHeader = ["Period"].concat(attrArray);

          chartD.push(chartHeader);

  
          for (const row of result.data) {
            try {
              // Build the temp array
                const foundItem = tempArray.find((item) => item.bucket === row["time"]);
                if (foundItem) {
                  attrArray.findIndex((x) => x === row.Customer) == 0
                    ? foundItem.attr1 = row.count
                    : foundItem.attr2 = row.count
                } else {
                  attrArray.findIndex((x) => x === row.Customer) == 0
                    ? tempArray.push({bucket: row["time"], attr1: row.count, attr2: 0})
                    : tempArray.push({bucket: row["time"], attr1: 0, attr2: row.count})
                }
            } catch (e) {
              console.log(e)
            }
          }

          // Convert tempArray (an array of JSON objects) to array of arrays
          for (const temp of tempArray) {
            chartD.push([temp.bucket, temp.attr1, temp.attr2])
          }
        }

        if (result.count > 0) {
          setChartData(chartD);
        } else {
          setChartData(null);
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      //setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }
  

  async function fetchItemOptions() {
    try {

      const dataURL = "/api/items";
      const response = await fetch(dataURL);
      const result = await response.json();
      
      if (result.success) {
        let chartD = [{}];
        for (const row of result.data) {
          try  {
            chartD.push({
              "id" : row["ItemId"],
              "value": row["ItemId"],
              "label": row["Description"]
            });
          } catch (e) {
            console.log(e)
          }
        }
        setSelectedItemOptions(chartD);
      } else {
        setError(result.message);
      }
    } catch (err) {
    //  setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }


  async function fetchCustomers() {
    try {

      const dataURL = "/api/customers";
      const response = await fetch(dataURL);
      const result = await response.json();
      
      if (result.success) {
        let chartD = [{}];
        for (const row of result.data) {
          try  {
            chartD.push({
              "id" : row["ItemId"],
              "value": row["ItemId"],
              "label": row["Description"]
            });
          } catch (e) {
            console.log(e)
          }
        }
        setSelectedCustomersOptions(chartD);
      } else {
        setError(result.message);
      }
    } catch (err) {
    //  setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setChartReady(false);
    fetchData(selectedValue, selectedItemValue, selectedCountValue, selectedCustomersValue);
  }, [selectedValue, selectedItemValue, selectedCountValue, selectedCustomersValue]);

  useEffect(() => {
   fetchData("annually", null, null, null);
   fetchItemOptions();
   fetchCustomers();
  }, []);


const chartEvents: ReactGoogleChartEvent[] = [
  {
    eventName: "ready",
    callback({ chartWrapper }) {
      const chart = chartWrapper ? chartWrapper.getChart() : console.log("hi");
      setChartReady(true);
    },
  }
];

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ paddingBottom: "10px" }}>
        <h1>Orders</h1>
      </div>
      { !chartReady && 
         <div className="loader"></div>
      }
      { !chartdata && !loading &&
         <div>No chart data available</div>
      }
      
      <Chart chartType="ColumnChart" width="100%" height="100%" data={chartdata ? chartdata : []}
        options={options} chartEvents={chartEvents}
        style={{display: !chartReady || !chartdata ? "none" : "block"}}/>
      
      <div style={{
        display: "flex",
        flexDirection: "column",
        padding: "10px",
        gap: "10px"}}
      >

        <h3>Options</h3>

        <table>
          <tbody>
            <tr className="optionWrapper">
              <td className="label">Period</td>
              <td>
                <select id="select-timeperiod" value={selectedValue} onChange={handleChange}
                  style={{ width: "min-content"}}>
                  <option value="annually">Annually</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </td>
            </tr>

            <tr className="optionWrapper">
              <td className="label">Measure</td>
              <td>
                <select id="select-amount" value={selectedCountValue} onChange={handleCountChange}
                  style={{ width: "min-content"}}>
                  <option value="count">Number of Orders</option>
                  <option value="quantity">Quantity Ordered</option>
                </select>
              </td>
            </tr>

            <tr className="optionWrapper">
              <td className="label">Item</td>
              <td>
                <select id="select-item" value={selectedItemValue} onChange={handleItemChange}
                  style={{ width: "min-content"}}>
                  <option value="">Select an item</option>
                  {selectedItemOptions.map((option, i) => (
                    <option key={i} value={option.value}>
                      {option.value + " " + option.label}
                    </option>
                  ))}
                </select>
              </td>
            </tr>

            <tr className="optionWrapper">
              <td className="label">Parent Customer</td>
              <td>
              <CustomerTypeahead 
                onCustomerSelect={handleCustomerChange}
              />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
