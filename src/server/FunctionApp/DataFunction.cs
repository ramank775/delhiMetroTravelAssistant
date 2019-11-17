using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Net.Http;
using System.Data.SqlClient;
using System.Data;

namespace delhiMetro
{

    public static class DataFunction
    {
        static readonly string connectionString = Environment.GetEnvironmentVariable("sql_coonnection");
        [FunctionName("getRouteDetail")]
        public static async Task<IActionResult> RouteDetail(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)] HttpRequest req,
            ILogger log)
        {
            string query = "exec procGetStationroute";
            using var rows = await ExecuteQuery(query);
            string result = JsonConvert.SerializeObject(rows);
            return new OkObjectResult(result);
        }

        [FunctionName("getStationDetail")]
        public static async Task<IActionResult> StationDetail(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)] HttpRequest req,
            ILogger log)
        {
            string query = "exec getallstation";
            using var rows = await ExecuteQuery(query);
            string result = JsonConvert.SerializeObject(rows);
            return new OkObjectResult(result);
        }

        private static async Task<DataTable> ExecuteQuery(string query)
        {
            using SqlConnection conn = new SqlConnection(connectionString);
            await conn.OpenAsync();
            DataTable _dt = new DataTable();
            using (SqlCommand cmd = new SqlCommand(query, conn))
            {
                using SqlDataAdapter _da = new SqlDataAdapter(cmd);
                _da.Fill(_dt);
            }
            return _dt;
        }
    }

}
