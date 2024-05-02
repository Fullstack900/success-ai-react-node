import * as adminService from "./admin.service.js";
import fs from "fs";

export function adminDetails(req, res) {
  res.send(req.user);
}

export async function getAccessToken(req, res) {
  const { id } = req.body;
  const authToken = await adminService.getAccessToken(id);
  res.send({ authToken });
}

export async function register(req, res) {
  const user = await adminService.register(req.body);
  res.send({ message: "Successfully Registered", user });
}

export async function verify(req, res) {
  const { token } = req.body;
  const authToken = await adminService.verify(token);
  res.send({ authToken });
}

export async function login(req, res) {
  const authToken = await adminService.login(req.body);
  res.send({ message: "Logged In", authToken });
}

export async function logout(req, res) {
  await authService.logout(req.user);
  res.send({ message: "Logged Out" });
}

export async function resetUserPassword(req, res) {
  const data = req.body

  const result = await adminService.resetUserPassword(data);
  res.send(result);
}
export async function getAllUsers(req, res) {
  const users = await adminService.getAllUsers(req);
  res.send({ users });
}
export async function updateUsage(req,res) {
  const {id} = req.params
  const data = req.body
  const invoices = await adminService.usageUpdate(id,data)
  res.send(invoices)
}

export async function getPlanUsage(req, res) {
  const { id } = req.params
  const planUsage = await adminService.getPlanUsage(id);
  res.send(planUsage)
}

export async function cancelSubscription(req, res) {
  const {
    userId,
    planId
  } = req.body;
  const response = await adminService.cancelSubscription(userId, planId);
  res.send(response);
}

export async function updatePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  await adminService.updatePassword(req.user._id, currentPassword, newPassword);
  res.send({ message: 'Password updated' });
}

export async function update(req, res) {
  const admin = await adminService.update(req.user._id, req.body);
  res.send({ message: 'Successfully updated', admin });
}

export async function appSumoRegister(req, res) {
  const user = await adminService.appSumoRegister(req.body);
  res.send({ message: "Successfully Registered", user });
}

export async function getInterComLogs(req, res) {
  const logFilePath = "intercom.log";

 fs.readFile(logFilePath, 'utf8', (err, data) => {
    if (err) {
      // Log file doesn't exist or is not readable
      return res.status(404).send('Log file not found');
    }

    res.setHeader('Content-Type', 'text/html');

    // Create an HTML page with a table for log data
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            table {
              border-collapse: collapse;
              width: 100%;
            }

            table, th, td {
              border: 1px solid black;
            }

            th, td {
              padding: 8px;
              text-align: left;
            }
          </style>
        </head>
        <body>
          <h1>Log Data</h1>
          <table>
            <tr>
              <th>Timestamp</th>
              <th>Level</th>
              <th>Message</th>
            </tr>
            ${data.split('\n').map(line => `
              <tr>
                <td>${line.split(' ')[0]||""}</td>
                <td>${line.split(' ')[1]||""}</td>
                <td>${line.split(' ').slice(2).join(' ')||""}</td>
              </tr>
            `).join('')||""}
          </table>
        </body>
      </html>
    `;

    res.send(htmlContent);
  });
}

export async function disableUser(req, res) {
  const {
    userId
  } = req.body;
  const response = await adminService.softDeleteUser(userId);
  res.send(response);
}

export async function enableUser(req, res) {
  const {
    userId
  } = req.body;
  const response = await adminService.restoreDeletedUser(userId);
  res.send(response);
}

export async function deletedUsers(req, res) {
  const {
    userId
  } = req.body;
  const response = await adminService.findDeletedUsers(userId);
  res.send(response);
}
export async function addCoupons(req, res) {
  const {
    coupons,
    priceId
  } = req.body;
  const response = await adminService.addCoupons(coupons, priceId);
  res.send(response);
}
export async function getExportUsers(req, res) {
  const users = await adminService.getExportUsers(req);
  res.send({ users });
}
export async function getUserPlan(req, res) {
  const plans = await adminService.getUserPlan(req);
  res.send({ plans });
}

export async function getUserSubscriptions(req, res) {
  const invoices = await adminService.getUserInvoices(req);
  res.send({ invoices });
}

export async function getExportUserPlans(req, res) {
  const allUsers = await adminService.getExportUserPlans(req);
  res.send({ allUsers });
}
export async function getFilterUserPlans(req, res) {
  const allUsers = await adminService.getFilterUserPlans(req);
  res.send({ allUsers });
}
export async function getRevenueAnalytics(req, res) {
  const response = await adminService.getRevenueAnalytics(req);
  res.send(response);
}
export async function getSignupUser(req, res) {
  const response = await adminService.getSignupUser(req);
  res.send(response);
}

export async function deleteUser(req, res) {
  const response = await adminService.deleteUser(req);
  res.send(response);
}

export async function updateAppSumoPlan(req, res){
  const response = await adminService.updateAppSumoPlan(req);
  res.send(response);
}
export async function getAllRequests(req, res) {
  const requests = await adminService.getAllRequests(req);
  res.send(requests);
}

export async function getAllEmailAnalytics(req, res) {
  const analytics = await adminService.getAllEmailAnalytics(req);
  res.send(analytics);
}

export async function getEmailAnalyticsChart(req, res) {
  const response = await adminService.getEmailAnalyticsChart(req);
  res.send(response);
}

export async function getAllRequestsChart(req, res) {
  const response = await adminService.getAllRequestsChart(req);
  res.send(response);
}

export async function getEmailAccounts(req, res) {
  const response = await adminService.getEmailAccounts(req);
  res.send(response);
}

export async function updateEmailAccounts(req, res) {
  const response = await adminService.updateEmailAccounts(req.body);
  res.send(response);
}

export async function getEmailAccountsAnalytics(req, res) {
  const response = await adminService.getEmailAccountsAnalytics(req, res);
  res.send(response);
}

export async function getExportAccounts(req, res) {
  const response = await adminService.getExportAccounts(req);
  res.send(response);
}

export async function getDkimData(req, res) {
  const response = await adminService.getDkimData(req);
  res.send(response);
}
