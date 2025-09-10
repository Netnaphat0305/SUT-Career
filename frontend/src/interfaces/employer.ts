import type { User } from "./user"
import type { Gender } from "./gender"

export interface Employer {
	ID: number;
	first_name: string;
	last_name: string;
	email: string;
	company_name: string;
	contact_person: string;
	birthday: Date;
	phone: string;
	address: string;
	user_id: number;
	user?: User;
	gender_id: number;
	gender?: Gender;
}

export interface SignInEmployer {
	email :string;
    password? :string;
}