import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  email: string;
  password?: string;
  role: "ADMIN" | "USER";
}

export interface CartItem {
  menuItemId: ObjectId;
  name: string;
  price: number;
  amount: number;
}

export interface Cart {
  _id?: ObjectId;
  userId?: ObjectId;
  items: CartItem[];
  totalPrice: number;
}

export interface FlashMessage {
  type: "succes" | "error" | "warning";
  text: string;
}
