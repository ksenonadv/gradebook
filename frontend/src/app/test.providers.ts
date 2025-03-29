import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { MessageService } from "primeng/api";

export const providers = [provideHttpClient(), provideHttpClientTesting(), MessageService];