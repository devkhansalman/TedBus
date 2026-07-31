export interface Customers{
    id?:string;
    name:string;
    googleId?:string;
    age?:number;
    gender?:string;
    email:string;
    dateofbirth?:string;
    profilePicture?:string;
    themePreference?: 'light' | 'dark';
    preferredLanguage?: string;
}
