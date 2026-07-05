import {
  DEFAULT_API_BASE_URL,
  createApiClient,
  type ApiClient,
  type Organizer,
} from "./index";

const client: ApiClient = createApiClient();

client.GET("/auth/me");

const baseUrl: "http://localhost:4010" = DEFAULT_API_BASE_URL;

const organizer: Organizer = {
  id: "usr_1",
  name: "Alex Organizer",
  email: "organizer@example.com",
  timezone: "Europe/Moscow",
};

void client;
void baseUrl;
void organizer;
