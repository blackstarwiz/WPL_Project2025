import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  name?: string;
  email: string;
  password?: string;
  phone?: string;
  role: "ADMIN" | "USER";
}

export interface Pizza {
  name: string;
  image: string;
  ingredients: string[];
  price: number;
}

export interface CartItem {
  menuItemId?: ObjectId;
  name: string;
  price: number;
  amount: number;
  image?: string;
}

export interface Cart {
  _id?: ObjectId;
  userId?: ObjectId;
  guestId?: string;
  items: CartItem[];
  totalPrice: number;
}

export interface FlashMessage {
  type: "success" | "error" | "warning";
  text: string;
}

export interface Review {
  _id?: ObjectId;
  naam: string;
  review: string;
  profielfoto: string;
  datum?: Date;
}

export interface Form{ 
  email?: string; 
  name?: string; 
  phone?: string 
};
