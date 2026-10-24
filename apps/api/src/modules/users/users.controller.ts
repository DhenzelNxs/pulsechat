import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/requireAuth';
import type { ValidatedQueryRequest } from '../../middleware/validate';
import * as usersService from './users.service';
import type { SearchUsersQuery } from './users.validation';

export async function search(
  req: AuthenticatedRequest & ValidatedQueryRequest<SearchUsersQuery>,
  res: Response,
) {
  const query = req.validatedQuery as SearchUsersQuery;
  const users = await usersService.searchUsers(req.userId as string, query.q);
  res.status(200).json({ users });
}
