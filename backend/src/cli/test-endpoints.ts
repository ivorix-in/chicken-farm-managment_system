import "dotenv/config";

async function main() {
  const PORT = process.env.PORT || 9000;
  const baseUrl = `http://localhost:${PORT}`;
  
  console.log("Logging in...");
  const loginRes = await fetch(`${baseUrl}/api/v1/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "farm@admin.com",
      password: "AdminPassword123!"
    })
  });
  
  const loginData = await loginRes.json() as any;
  const token = loginData.accessToken;
  console.log("Token acquired.");
  
  const headers = { Authorization: `Bearer ${token}` };
  
  console.log("\n--- Testing Farmers ---");
  const farmersRes = await fetch(`${baseUrl}/api/v1/admin/farmers`, { headers });
  console.log("Farmers response:", JSON.stringify(await farmersRes.json(), null, 2));

  console.log("\n--- Testing Areas ---");
  const areasRes = await fetch(`${baseUrl}/api/v1/admin/areas`, { headers });
  console.log("Areas response:", JSON.stringify(await areasRes.json(), null, 2));

  console.log("\n--- Testing Employees ---");
  const employeesRes = await fetch(`${baseUrl}/api/v1/admin/employees`, { headers });
  console.log("Employees response:", JSON.stringify(await employeesRes.json(), null, 2));
}

main().catch(console.error);
