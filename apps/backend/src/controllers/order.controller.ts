import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';
import { successResponse, errorResponse } from '../utils/response';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import { sendOrderConfirmationEmail } from '../utils/email';

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }

    const { addressId, paymentMethod, notes } = req.body;

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.userId },
      include: {
        items: {
          include: {
            product: {
              include: { inventory: true },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      errorResponse(res, 'Cart is empty', 400);
      return;
    }

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: req.user.userId,
      },
    });

    if (!address) {
      errorResponse(res, 'Address not found', 404);
      return;
    }

    // Check inventory availability
    for (const item of cart.items) {
      if (item.product.inventory) {
        const availableQuantity =
          item.product.inventory.quantity - item.product.inventory.reservedQuantity;

        if (availableQuantity < item.quantity) {
          errorResponse(
            res,
            `Insufficient stock for ${item.product.name}`,
            400
          );
          return;
        }
      }
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.1; // 10% tax
    const shippingCost = 10; // Fixed shipping
    const total = subtotal + tax + shippingCost;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order with items and payment
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: req.user.userId,
        addressId,
        subtotal,
        tax,
        shippingCost,
        total,
        status: OrderStatus.PENDING,
        notes,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
          })),
        },
        payment: {
          create: {
            amount: total,
            currency: 'USD',
            method: paymentMethod as PaymentMethod,
            status: PaymentStatus.PENDING,
          },
        },
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
              },
            },
          },
        },
        address: true,
        payment: true,
      },
    });

    // Reserve inventory
    for (const item of cart.items) {
      if (item.product.inventory) {
        await prisma.productInventory.update({
          where: { productId: item.productId },
          data: {
            reservedQuantity: {
              increment: item.quantity,
            },
          },
        });
      }
    }

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // Send confirmation email
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
      });
      if (user) {
        await sendOrderConfirmationEmail(user.email, orderNumber, total);
      }
    } catch (emailError) {
      console.error('Failed to send order confirmation:', emailError);
    }

    successResponse(res, order, 'Order created successfully', 201);
  } catch (error) {
    console.error('Create order error:', error);
    errorResponse(res, 'Failed to create order', 500);
  }
};

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }

    const { page = '1', limit = '20', status } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      userId: req.user.userId,
    };

    if (status) {
      where.status = status as OrderStatus;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limitNum,
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
          address: true,
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    successResponse(res, {
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    errorResponse(res, 'Failed to get orders', 500);
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }

    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
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
              },
            },
          },
        },
        address: true,
        payment: true,
      },
    });

    if (!order) {
      errorResponse(res, 'Order not found', 404);
      return;
    }

    successResponse(res, order);
  } catch (error) {
    console.error('Get order error:', error);
    errorResponse(res, 'Failed to get order', 500);
  }
};

export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20', status, search } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status) {
      where.status = status as OrderStatus;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search as string, mode: 'insensitive' } },
        { user: { email: { contains: search as string, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: {
                    take: 1,
                    orderBy: { displayOrder: 'asc' },
                  },
                },
              },
            },
          },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    successResponse(res, {
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    errorResponse(res, 'Failed to get orders', 500);
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, estimatedDelivery } = req.body;

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: status as OrderStatus,
        trackingNumber,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
        ...(status === OrderStatus.DELIVERED && {
          deliveredAt: new Date(),
        }),
      },
      include: {
        items: true,
        payment: true,
      },
    });

    // If order is cancelled, release reserved inventory
    if (status === OrderStatus.CANCELLED) {
      for (const item of order.items) {
        await prisma.productInventory.updateMany({
          where: { productId: item.productId },
          data: {
            reservedQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }
    }

    // If order is delivered, update inventory and sales count
    if (status === OrderStatus.DELIVERED) {
      for (const item of order.items) {
        await prisma.productInventory.updateMany({
          where: { productId: item.productId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
            reservedQuantity: {
              decrement: item.quantity,
            },
          },
        });

        await prisma.product.update({
          where: { id: item.productId },
          data: {
            salesCount: {
              increment: item.quantity,
            },
          },
        });
      }
    }

    successResponse(res, order, 'Order status updated');
  } catch (error) {
    console.error('Update order status error:', error);
    errorResponse(res, 'Failed to update order status', 500);
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }

    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
      include: { items: true },
    });

    if (!order) {
      errorResponse(res, 'Order not found', 404);
      return;
    }

    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PAID) {
      errorResponse(res, 'Order cannot be cancelled', 400);
      return;
    }

    await prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
    });

    // Release reserved inventory
    for (const item of order.items) {
      await prisma.productInventory.updateMany({
        where: { productId: item.productId },
        data: {
          reservedQuantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    successResponse(res, null, 'Order cancelled successfully');
  } catch (error) {
    console.error('Cancel order error:', error);
    errorResponse(res, 'Failed to cancel order', 500);
  }
};
