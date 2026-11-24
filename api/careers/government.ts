import {
  handleCareersGovernmentRequest,
  type ApiRequest,
  type ApiResponse,
} from '../../server/apiHandlers.js';

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  await handleCareersGovernmentRequest(req, res);
}
