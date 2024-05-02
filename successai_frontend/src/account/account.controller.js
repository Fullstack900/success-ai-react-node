import * as accountService from './account.service.js';
import HttpErrors from 'http-errors';
import WarmupStatus from './enum/warmup-status.enum.js';
import SearchFilter from './enum/search-filter.enum.js';
import AccountStatus from './enum/account-status.enum.js';

export async function connectMicrosoftAccount(req, res) {
  const account = await accountService.connectMicrosoftAccount(
    req.body.code,
    req.user,
    req.query.reconnect
  );

  res.send({ message: 'Account Connected', account });
}

export async function connectCustomImapSmtpAccount(req, res) {
  if (req.body.warmup?.enabled) {
    req.body.warmup.status = req.body.warmup.enabled
      ? WarmupStatus.Enabled
      : WarmupStatus.Paused;
  }

  const account = await accountService.connectCustomImapSmtpAccount(
    req.body,
    req.user,
    req.query.reconnect
  );

  res.send({ message: 'Account Connected', account });
}

export async function connectGoogleAccount(req, res) {
  const account = await accountService.connectGoogleAccount(
    req.body.code,
    req.user,
    req.query.reconnect
  );

  res.send({ message: 'Account Connected', account });
}

export async function connectGoogleImapSmtp(req, res) {
  const account = await accountService.connectGoogleImapSmtp(
    req.body,
    req.user,
    req.query.reconnect
  );

  res.send({ message: 'Account Connected', account });
}

export async function getAll(req, res) {
  const { search, filter, offset = 0, limit = 10 } = req.query;

  const query = {
    email: new RegExp(search?.replace(/[^a-zA-Z0-9]/g, '\\$&'), 'i'),
    createdBy: req.user,
  };

  switch (filter) {
    case SearchFilter.Paused:
      query.status = AccountStatus.Paused;
      break;
    case SearchFilter.HasErrors:
      query.status = AccountStatus.Disconnected;
      break;
    case SearchFilter.NoCustomTrackingDomain:
      query['customDomain.isEnable'] = false;
      break;
    case SearchFilter.WarmupActive:
      query['warmup.status'] = WarmupStatus.Enabled;
      break;
    case SearchFilter.WarmupPaused:
      query['warmup.status'] = WarmupStatus.Paused;
      break;
    case SearchFilter.WarmupHasErrors:
      query['warmup.status'] = WarmupStatus.Disabled;
      break;
  }

  const options = { offset, limit };

  const accounts = await accountService.getPaginated(query, options);

  const warmupStats = await accountService.getWarmupStats(
    accounts.docs.map((a) => a.email)
  );

  accounts.docs.forEach((account) => {
    account.warmupStats = warmupStats.find(
      (stat) => stat._id === account.email
    );
  }); 

  res.send(accounts);
}

// Get Owned Account of User
async function getOwnedAccount(req) {
  const account = await accountService.findById(req.params.id);
  if (!account) throw new HttpErrors.NotFound('Account not found');
  if (!account.createdBy.equals(req.user._id)) throw new HttpErrors.Forbidden();
  return account;
}

export async function update(req, res) {
  const account = await getOwnedAccount(req);
  const updatedAccount = await accountService.update(account._id, req.body);
  res.send({ message: 'Account updated', account: updatedAccount });
}

export async function pauseAccount(req, res) {
  const account = await getOwnedAccount(req);
  const updatedAccount = await accountService.update(account._id, {
    status: AccountStatus.Paused,
  });
  res.send({ message: 'Account paused', account: updatedAccount });
}

export async function resumeAccount(req, res) {
  const account = await getOwnedAccount(req);
  const updatedAccount = await accountService.update(account._id, {
    status: AccountStatus.Connected,
  });
  res.send({ message: 'Account resumed', account: updatedAccount });
}

export async function enableWarmup(req, res) {
  const account = await getOwnedAccount(req);
  const updatedAccount = await accountService.update(account._id, {
    'warmup.status': WarmupStatus.Enabled,
  });
  res.send({ message: 'Warmup enabled', account: updatedAccount });
}

export async function pauseWarmup(req, res) {
  const account = await getOwnedAccount(req);
  const updatedAccount = await accountService.update(account._id, {
    'warmup.status': WarmupStatus.Paused,
  });
  res.send({ message: 'Warmup paused', account: updatedAccount });
}

export async function bulkDelete(req, res) {
  const { deleteAll, ids } = req.body;

  if (deleteAll) {
    await accountService.deleteMany({ createdBy: req.user });
    return res.send({ message: 'All Accounts Deleted' });
  }

  await accountService.deleteMany({ _id: { $in: ids }, createdBy: req.user });
  res.send({ message: 'Accounts Deleted' });
}

export async function remove(req, res) {
  const account = await getOwnedAccount(req);
  await accountService.deleteOne(account._id);
  res.send({ message: 'Account deleted' });
}

export async function testImap(req, res) {
  try {
    await accountService.testImap(req.body);
  } catch (error) {
    throw new HttpErrors.BadRequest('Invalid IMAP credentials');
  }

  res.send({ message: 'Test connection successful' });
}

export async function testSmtp(req, res) {
  try {
    await accountService.testSmtp(req.body);
  } catch (error) {
    throw new HttpErrors.BadRequest('Invalid SMTP credentials');
  }

  res.send({ message: 'Test connection successful' });
}
