import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';
import { successResponse, errorResponse } from '../utils/response';

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  take: 1,
                  orderBy: { displayOrder: 'asc' },
                },
                inventory: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: req.user.userId,
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    take: 1,
                    orderBy: { displayOrder: 'asc' },
                  },
                  inventory: true,
                },
              },
            },
          },
        },
      });
    }

    // Calculate cart total
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    successResponse(res, {
      ...cart,
      subtotal,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (error) {
    console.error('Get cart error:', error);
    errorResponse(res, 'Failed to get cart', 500);
  }
};

export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }

    const { productId, quantity = 1 } = req.body;

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.userId },
      });
    }

    // Get product with inventory
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { inventory: true },
    });

    if (!product) {
      errorResponse(res, 'Product not found', 404);
      return;
    }

    if (product.status !== 'PUBLISHED') {
      errorResponse(res, 'Product is not available', 400);
      return;
    }

    // Check inventory
    if (product.inventory && product.inventory.quantity < quantity) {
      errorResponse(res, 'Insufficient stock', 400);
      return;
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    const price = product.salePrice || product.basePrice;

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;

      if (product.inventory && product.inventory.quantity < newQuantity) {
        errorResponse(res, 'Insufficient stock', 400);
        return;
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          price,
        },
      });
    } else {
      // Add new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          price,
        },
      });
    }

    // Return updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  take: 1,
                  orderBy: { displayOrder: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    successResponse(res, updatedCart, 'Item added to cart');
  } catch (error) {
    console.error('Add to cart error:', error);
    errorResponse(res, 'Failed to add item to cart', 500);
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }

    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      errorResponse(res, 'Quantity must be at least 1', 400);
      return;
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
        product: {
          include: { inventory: true },
        },
      },
    });

    if (!cartItem) {
      errorResponse(res, 'Cart item not found', 404);
      return;
    }

    if (cartItem.cart.userId !== req.user.userId) {
      errorResponse(res, 'Forbidden', 403);
      return;
    }

    // Check inventory
    if (cartItem.product.inventory && cartItem.product.inventory.quantity < quantity) {
      errorResponse(res, 'Insufficient stock', 400);
      return;
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    successResponse(res, null, 'Cart item updated');
  } catch (error) {
    console.error('Update cart item error:', error);
    errorResponse(res, 'Failed to update cart item', 500);
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }

    const { itemId } = req.params;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!cartItem) {
      errorResponse(res, 'Cart item not found', 404);
      return;
    }

    if (cartItem.cart.userId !== req.user.userId) {
      errorResponse(res, 'Forbidden', 403);
      return;
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    successResponse(res, null, 'Item removed from cart');
  } catch (error) {
    console.error('Remove from cart error:', error);
    errorResponse(res, 'Failed to remove item from cart', 500);
  }
};

export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.userId },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    successResponse(res, null, 'Cart cleared');
  } catch (error) {
    console.error('Clear cart error:', error);
    errorResponse(res, 'Failed to clear cart', 500);
  }
};
