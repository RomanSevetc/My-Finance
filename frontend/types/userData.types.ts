export interface UserData {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    birth_date?: string;
    gender?: string;
    balance: number;
    last_login?: string;
    date_joined: string;
    is_active: boolean;
    avatar?: string;
}