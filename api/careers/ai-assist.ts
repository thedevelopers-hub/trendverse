import {
  handleCareersAiAssistRequest,
  type ApiRequest,
  type ApiResponse,
} from '../../server/apiHandlers.js';

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  await handleCareersAiAssistRequest(req, res);
}
