export type SellerType = 'individual' | 'business';

export type Seller = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  phoneCode: string;
  phoneNumber: string;
  sellerType: SellerType;
  createdAt: string;
  updatedAt: string;
};

export type SellerInput = {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  phoneCode: string;
  phoneNumber: string;
  sellerType: SellerType;
  password?: string;
};

export function formatSellerPhone(seller: Pick<Seller, 'phoneCode' | 'phoneNumber'>) {
  return `${seller.phoneCode} ${seller.phoneNumber}`.trim();
}
