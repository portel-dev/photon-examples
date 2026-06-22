/**
 * Pizza Shop - AI Pizza Ordering Assistant
 *
 * Demonstrates the AI+Human transaction workflow for food ordering:
 * 1. AI suggests pizzas based on preferences
 * 2. Human selects and customizes items
 * 3. Human reviews cart and confirms order
 * 4. System processes order with delivery info
 *
 * @version 1.0.0
 * @author Photon Team
 * @runtime ^1.4.0
 * @icon 🍕
 */

import { io } from '@portel/photon-core';

interface Pizza {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'classic' | 'specialty' | 'vegetarian' | 'meat-lovers';
  toppings: string[];
  spicy?: boolean;
  popular?: boolean;
}

interface OrderItem {
  pizza: Pizza;
  size: 'small' | 'medium' | 'large';
  quantity: number;
  extraToppings: string[];
  notes?: string;
}

const SIZE_MULTIPLIERS = {
  small: 0.8,
  medium: 1.0,
  large: 1.3
};

export default class PizzaShop {
  private cart: OrderItem[] = [];

  // Pizza menu
  private menu: Pizza[] = [
    {
      id: 'margherita',
      name: 'Margherita',
      description: 'Fresh mozzarella, tomato sauce, basil',
      price: 12.99,
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200',
      category: 'classic',
      toppings: ['mozzarella', 'tomato sauce', 'basil'],
      popular: true
    },
    {
      id: 'pepperoni',
      name: 'Pepperoni',
      description: 'Classic pepperoni with mozzarella',
      price: 14.99,
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=200',
      category: 'meat-lovers',
      toppings: ['pepperoni', 'mozzarella', 'tomato sauce'],
      popular: true
    },
    {
      id: 'bbq-chicken',
      name: 'BBQ Chicken',
      description: 'Grilled chicken, BBQ sauce, red onion, cilantro',
      price: 16.99,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200',
      category: 'specialty',
      toppings: ['chicken', 'bbq sauce', 'red onion', 'cilantro', 'mozzarella']
    },
    {
      id: 'meat-supreme',
      name: 'Meat Supreme',
      description: 'Pepperoni, sausage, bacon, ham, beef',
      price: 18.99,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200',
      category: 'meat-lovers',
      toppings: ['pepperoni', 'sausage', 'bacon', 'ham', 'beef', 'mozzarella']
    },
    {
      id: 'veggie-garden',
      name: 'Veggie Garden',
      description: 'Bell peppers, mushrooms, olives, onions, tomatoes',
      price: 14.99,
      image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=200',
      category: 'vegetarian',
      toppings: ['bell peppers', 'mushrooms', 'olives', 'onions', 'tomatoes', 'mozzarella']
    },
    {
      id: 'quattro-formaggi',
      name: 'Quattro Formaggi',
      description: 'Four cheese: mozzarella, gorgonzola, parmesan, ricotta',
      price: 15.99,
      image: 'https://images.unsplash.com/photo-1548369937-47519962c11a?w=200',
      category: 'vegetarian',
      toppings: ['mozzarella', 'gorgonzola', 'parmesan', 'ricotta']
    },
    {
      id: 'hawaiian',
      name: 'Hawaiian',
      description: 'Ham, pineapple, mozzarella',
      price: 14.99,
      image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200',
      category: 'classic',
      toppings: ['ham', 'pineapple', 'mozzarella', 'tomato sauce']
    },
    {
      id: 'diavola',
      name: 'Diavola',
      description: 'Spicy salami, chili flakes, jalapeños',
      price: 15.99,
      image: 'https://images.unsplash.com/photo-1458642849426-cfb724f15ef7?w=200',
      category: 'specialty',
      toppings: ['spicy salami', 'chili flakes', 'jalapeños', 'mozzarella'],
      spicy: true
    }
  ];

  // Extra toppings available
  private extraToppings = [
    { id: 'extra-cheese', name: 'Extra Cheese', price: 2.00 },
    { id: 'pepperoni', name: 'Pepperoni', price: 1.50 },
    { id: 'mushrooms', name: 'Mushrooms', price: 1.00 },
    { id: 'olives', name: 'Olives', price: 1.00 },
    { id: 'onions', name: 'Onions', price: 0.75 },
    { id: 'bell-peppers', name: 'Bell Peppers', price: 1.00 },
    { id: 'jalapenos', name: 'Jalapeños', price: 0.75 },
    { id: 'bacon', name: 'Bacon', price: 2.00 },
    { id: 'anchovies', name: 'Anchovies', price: 1.50 }
  ];

  /**
   * Browse the pizza menu
   *
   * Filter by category and select pizzas to add to cart.
   *
   * @format markdown
   */
  async *browseMenu() {
    yield io.emit.status('Loading menu...');

    // Get unique categories for filter buttons
    const categories = ['All', 'Classic', 'Specialty', 'Vegetarian', 'Meat Lovers'];

    // Present menu with filters and search
    const selected: string[] = yield io.ask.select(
      '🍕 Welcome to Pizza Shop! Select pizzas to add to your order:',
      this.menu.map(pizza => ({
        value: pizza.id,
        label: pizza.name,
        description: pizza.description,
        image: pizza.image,
        price: pizza.price,
        badge: pizza.popular ? 'Popular' : pizza.spicy ? '🌶️ Spicy' : undefined,
        badgeType: pizza.popular ? 'info' as const : pizza.spicy ? 'error' as const : 'default' as const,
        category: pizza.category.replace('-', ' ')
      })),
      {
        multi: true,
        layout: 'list',
        filters: categories,
        filterField: 'category',
        searchable: true,
        searchPlaceholder: 'Search pizzas...'
      }
    );

    if (!selected || selected.length === 0) {
      return { message: 'No pizzas selected. Browse our menu anytime!' };
    }

    // For each selected pizza, ask for customization
    for (const pizzaId of selected) {
      const pizza = this.menu.find(p => p.id === pizzaId);
      if (!pizza) continue;

      yield io.emit.status(`Customizing ${pizza.name}...`);

      // Ask for size
      const size: string = yield io.ask.select(
        `Choose size for ${pizza.name}:`,
        [
          { value: 'small', label: 'Small (10")', description: `$${(pizza.price * 0.8).toFixed(2)}` },
          { value: 'medium', label: 'Medium (12")', description: `$${pizza.price.toFixed(2)}` },
          { value: 'large', label: 'Large (14")', description: `$${(pizza.price * 1.3).toFixed(2)}` }
        ],
        { layout: 'list' }
      );

      // Ask for extra toppings
      const extras: string[] = yield io.ask.select(
        `Add extra toppings to ${pizza.name}? (+$0.75-$2.00 each)`,
        this.extraToppings.map(t => ({
          value: t.id,
          label: t.name,
          description: `+$${t.price.toFixed(2)}`
        })),
        { multi: true, layout: 'list' }
      );

      // Add to cart
      this.cart.push({
        pizza,
        size: size as 'small' | 'medium' | 'large',
        quantity: 1,
        extraToppings: extras || []
      });
    }

    yield io.emit.toast(`Added ${selected.length} pizza(s) to cart!`, 'success');

    return this.formatCartAsBill('Pizzas Added!');
  }

  /**
   * Get AI pizza recommendations
   *
   * Tell us your preferences and we'll suggest the perfect pizzas!
   *
   * @param preferences What kind of pizza are you in the mood for?
   * @format markdown
   */
  async *recommend(params: { preferences: string }) {
    yield io.emit.status('Analyzing your preferences...');
    yield io.emit.thinking(true);

    const prefs = params.preferences.toLowerCase();
    let recommendations: Pizza[] = [];
    
    // Parse size from preference string (fallback/initial)
    let parsedSize: 'small' | 'medium' | 'large' = 'medium';
    if (/\bsmall\b/i.test(prefs)) {
      parsedSize = 'small';
    } else if (/\blarge\b/i.test(prefs)) {
      parsedSize = 'large';
    } else if (/\b(medium|regular)\b/i.test(prefs)) {
      parsedSize = 'medium';
    }

    // Parse extra toppings from preference string (fallback/initial)
    let parsedExtraToppings: string[] = [];
    if (/\b(extra\s+)?cheese\b/i.test(prefs)) parsedExtraToppings.push('extra-cheese');
    if (/\bpepperoni\b/i.test(prefs)) parsedExtraToppings.push('pepperoni');
    if (/\bmushroom(s)?\b/i.test(prefs)) parsedExtraToppings.push('mushrooms');
    if (/\bolive(s)?\b/i.test(prefs)) parsedExtraToppings.push('olives');
    if (/\bonion(s)?\b/i.test(prefs)) parsedExtraToppings.push('onions');
    if (/\b(bell\s+)?pepper(s)?\b/i.test(prefs) && !prefs.includes('pepperoni')) parsedExtraToppings.push('bell-peppers');
    if (/\bjalapeno(s)?\b/i.test(prefs) || /\bjalapeño(s)?\b/i.test(prefs)) parsedExtraToppings.push('jalapenos');
    if (/\bbacon\b/i.test(prefs)) parsedExtraToppings.push('bacon');
    if (/\banchov(y|ies)\b/i.test(prefs)) parsedExtraToppings.push('anchovies');

    // Attempt AI-based semantic matching using sampling API
    try {
      const menuDescription = this.menu.map(p => 
        `- ID: ${p.id}, Name: ${p.name}, Description: ${p.description}, Category: ${p.category}, Toppings: ${p.toppings.join(', ')}`
      ).join('\n');

      const prompt = `You are a helpful AI assistant for a Pizza Shop.
The customer has specified the following pizza preferences or keywords: "${params.preferences}"

Here is our menu:
${menuDescription}

And here are the available extra toppings:
${this.extraToppings.map(t => `- ID: ${t.id}, Name: ${t.name}`).join('\n')}

Based on the customer's input, parse their order preferences.
Return a JSON object with the following fields:
1. "pizzaIds": array of matching pizza IDs from the menu (e.g., ["margherita", "pepperoni"]). If no specific pizzas are mentioned, recommend the most relevant ones.
2. "size": the requested size of the pizza if mentioned ("small", "medium", or "large"). Default to "medium" if not specified.
3. "extraToppings": array of topping IDs matching the extra toppings list if they want them added (e.g., ["extra-cheese", "mushrooms"]). Only include toppings they explicitly wanted to add.

Format your response as a valid JSON object. Do not include markdown formatting or backticks around the JSON.`;

      const response = await (this as any).sample({
        prompt,
        maxTokens: 256
      });

      if (response && typeof response === 'string') {
        // Clean markdown code blocks if any
        let cleanResponse = response.trim();
        if (cleanResponse.startsWith('```json')) {
          cleanResponse = cleanResponse.substring(7);
        } else if (cleanResponse.startsWith('```')) {
          cleanResponse = cleanResponse.substring(3);
        }
        if (cleanResponse.endsWith('```')) {
          cleanResponse = cleanResponse.substring(0, cleanResponse.length - 3);
        }
        cleanResponse = cleanResponse.trim();
        
        const parsed = JSON.parse(cleanResponse);
        if (parsed && Array.isArray(parsed.pizzaIds) && parsed.pizzaIds.length > 0) {
          recommendations = this.menu.filter(p => parsed.pizzaIds.includes(p.id));
        }
        if (parsed && ['small', 'medium', 'large'].includes(parsed.size)) {
          parsedSize = parsed.size as 'small' | 'medium' | 'large';
        }
        if (parsed && Array.isArray(parsed.extraToppings)) {
          parsedExtraToppings = parsed.extraToppings.filter(t => this.extraToppings.some(et => et.id === t));
        }
      }
    } catch (e) {
      // Graceful fallback to keyword matching if AI sampling is unavailable or JSON parsing fails
    }

    // Keyword Fallback matching for pizzas if not found yet
    if (recommendations.length === 0) {
      if (prefs.includes('meat') || prefs.includes('protein') || prefs.includes('beef') || prefs.includes('bacon')) {
        recommendations = this.menu.filter(p => p.category === 'meat-lovers');
      } else if (prefs.includes('veggie') || prefs.includes('vegetarian') || prefs.includes('healthy') || prefs.includes('onion')) {
        recommendations = this.menu.filter(p => p.category === 'vegetarian');
      } else if (prefs.includes('spicy') || prefs.includes('hot') || prefs.includes('chili')) {
        recommendations = this.menu.filter(p => p.spicy);
      } else if (prefs.includes('classic') || prefs.includes('simple') || prefs.includes('traditional') || prefs.includes('tomato')) {
        recommendations = this.menu.filter(p => p.category === 'classic');
      } else if (prefs.includes('popular') || prefs.includes('best')) {
        recommendations = this.menu.filter(p => p.popular);
      } else {
        // Default to popular items
        recommendations = this.menu.filter(p => p.popular || p.category === 'specialty');
      }
    }

    yield io.emit.thinking(false);

    if (recommendations.length === 0) {
      recommendations = this.menu.slice(0, 3);
    }

    yield io.emit.status(`Found ${recommendations.length} recommendations!`);

    // Present recommendations
    const selected: string[] = yield io.ask.select(
      `Based on "${params.preferences}", here are my top picks:`,
      recommendations.map(pizza => ({
        value: pizza.id,
        label: pizza.name,
        description: pizza.description,
        image: pizza.image,
        price: pizza.price,
        badge: pizza.popular ? '⭐ Recommended' : undefined,
        badgeType: 'success' as const,
        category: pizza.category
      })),
      { multi: true, layout: 'list' }
    );

    if (!selected || selected.length === 0) {
      return { message: 'No pizzas selected. Try browsing the full menu!' };
    }

    // For each selected pizza, ask for customization
    for (const pizzaId of selected) {
      const pizza = this.menu.find(p => p.id === pizzaId);
      if (!pizza) continue;

      yield io.emit.status(`Customizing ${pizza.name}...`);

      // Ask for size with default parsed size pre-selected
      const size: string = yield io.ask.select(
        `Choose size for recommended ${pizza.name}:`,
        [
          { value: 'small', label: 'Small (10")', description: `$${(pizza.price * 0.8).toFixed(2)}`, selected: parsedSize === 'small' },
          { value: 'medium', label: 'Medium (12")', description: `$${pizza.price.toFixed(2)}`, selected: parsedSize === 'medium' },
          { value: 'large', label: 'Large (14")', description: `$${(pizza.price * 1.3).toFixed(2)}`, selected: parsedSize === 'large' }
        ],
        { layout: 'list' }
      );

      // Ask for extra toppings with default parsed toppings pre-selected
      const extras: string[] = yield io.ask.select(
        `Add extra toppings to ${pizza.name}? (+$0.75-$2.00 each)`,
        this.extraToppings.map(t => ({
          value: t.id,
          label: t.name,
          description: `+$${t.price.toFixed(2)}`,
          selected: parsedExtraToppings.includes(t.id)
        })),
        { multi: true, layout: 'list' }
      );

      // Add to cart
      this.cart.push({
        pizza,
        size: size as 'small' | 'medium' | 'large',
        quantity: 1,
        extraToppings: extras || []
      });
    }

    yield io.emit.toast(`Added ${selected.length} recommended pizza(s) with toppings!`, 'success');

    return this.formatCartAsBill('Pizzas Added!');
  }

  /**
   * View and modify your cart
   *
   * Adjust quantities, remove items, or proceed to checkout.
   *
   * @format markdown
   */
  async *viewCart() {
    if (this.cart.length === 0) {
      yield io.emit.toast('Your cart is empty!', 'info');
      return { items: [], total: 0, message: 'Add some pizzas first!' };
    }

    const total = this.calculateTotal();

    // Show cart with adjustable quantities
    const result: any = yield io.ask.select(
      `🛒 Your Cart ($${total.toFixed(2)}). Adjust quantities or uncheck to remove:`,
      this.cart.map((item, idx) => ({
        value: `${idx}`,
        label: `${item.pizza.name} (${item.size})`,
        description: item.extraToppings.length > 0
          ? `+${item.extraToppings.join(', ')}`
          : item.pizza.toppings.slice(0, 3).join(', '),
        image: item.pizza.image,
        price: this.calculateItemPrice(item),
        quantity: item.quantity,
        adjustable: true,
        minQuantity: 0,
        maxQuantity: 5,
        selected: true
      })),
      { multi: true, layout: 'list' }
    );

    // Handle result with quantities
    const keepIndices = Array.isArray(result) ? result : (result?.value || []);
    const quantities = result?.quantities || {};

    // Update cart
    this.cart = this.cart
      .map((item, idx) => {
        if (quantities[`${idx}`] !== undefined) {
          item.quantity = quantities[`${idx}`];
        }
        return item;
      })
      .filter((item, idx) => keepIndices.includes(`${idx}`) && item.quantity > 0);

    const newTotal = this.calculateTotal();

    return this.formatCartAsBill('Your Cart Updated!');
  }

  /**
   * Complete your order
   *
   * Review cart, enter delivery info, and place your order!
   *
   * @format markdown
   */
  async *checkout() {
    if (this.cart.length === 0) {
      yield io.emit.toast('Your cart is empty!', 'warning');
      return '### ⚠️ Cart is Empty!\n\nPlease add some pizzas to your cart before checking out.';
    }

    // 1. Choose Order Type
    const orderType: 'delivery' | 'pickup' = yield io.ask.select('🥡 Select Order Type', [
      { value: 'delivery', label: '🚗 Delivery (+$3.99)', description: 'Delivered to your door in 30-45 mins' },
      { value: 'pickup', label: '🥡 Store Pickup ($0.00)', description: 'Ready at our main branch in 15 mins' }
    ]);

    // 2. Choose Payment Method
    const paymentMethod: 'card' | 'cod' = yield io.ask.select('💳 Select Payment Method', [
      { value: 'card', label: '💳 Credit / Debit Card', description: 'Pay securely online' },
      { value: 'cod', label: orderType === 'pickup' ? '💵 Pay on Pickup' : '💵 Cash on Delivery', description: 'Pay with cash or card upon receipt' }
    ]);

    // 3. Collect Card Details if card selected
    let cardInfo = null;
    if (paymentMethod === 'card') {
      cardInfo = yield io.ask.form('💳 Card Details', {
        type: 'object',
        properties: {
          cardholder: { type: 'string', title: 'Cardholder Name' },
          cardNumber: { type: 'string', title: 'Card Number (16 digits)' },
          expiry: { type: 'string', title: 'Expiry Date (MM/YY)' },
          cvv: { type: 'string', title: 'CVV' }
        },
        required: ['cardholder', 'cardNumber', 'expiry', 'cvv']
      });
    }

    // 4. Collect customer and location details
    let customerName = '';
    let customerPhone = '';
    let addressStr = '';
    let instructions = '';

    if (orderType === 'delivery') {
      const delivery = yield io.ask.form('🚗 Delivery Address', {
        type: 'object',
        properties: {
          name: { type: 'string', title: 'Your Name' },
          phone: { type: 'string', title: 'Phone Number' },
          address: { type: 'string', title: 'Street Address' },
          apt: { type: 'string', title: 'Apt/Suite (optional)' },
          city: { type: 'string', title: 'City' },
          zip: { type: 'string', title: 'ZIP Code' },
          instructions: { type: 'string', title: 'Delivery Instructions (optional)' }
        },
        required: ['name', 'phone', 'address', 'city', 'zip']
      });
      customerName = delivery.name;
      customerPhone = delivery.phone;
      addressStr = `${delivery.address}${delivery.apt ? ', ' + delivery.apt : ''}\n${delivery.city}, ${delivery.zip}`;
      instructions = delivery.instructions;
    } else {
      const pickup = yield io.ask.form('🥡 Pickup Contact', {
        type: 'object',
        properties: {
          name: { type: 'string', title: 'Your Name' },
          phone: { type: 'string', title: 'Phone Number' },
          pickupTime: { type: 'string', title: 'Pickup Time (ASAP / Specific time)' }
        },
        required: ['name', 'phone']
      });
      customerName = pickup.name;
      customerPhone = pickup.phone;
      addressStr = '🥡 Store Pickup: 742 Evergreen Terrace, Springfield';
      instructions = `Pickup Time: ${pickup.pickupTime || 'ASAP'}`;
    }

    // 5. Generate temporary order details for confirmation
    const tempReceipt = this.formatCartAsBill('Confirm Order Details', {
      orderType: orderType === 'delivery' ? 'Delivery' : 'Pickup',
      paymentMethod: paymentMethod === 'card' ? 'Credit Card' : (orderType === 'pickup' ? 'Pay on Pickup' : 'Cash on Delivery'),
      customerName,
      customerPhone,
      deliveryAddress: addressStr,
      instructions
    });

    const confirmed: boolean = yield io.ask.confirm(
      `${tempReceipt}\n\nDo you want to confirm and place this order?`
    );

    if (!confirmed) {
      yield io.emit.toast('Checkout cancelled', 'info');
      return '### ❌ Checkout Cancelled\n\nYour order has not been placed. Feel free to continue customizing or browse the menu!';
    }

    // 6. Process payment & order
    yield io.emit.progress(0.2, 'Validating order...');
    await this.delay(500);

    if (paymentMethod === 'card') {
      yield io.emit.progress(0.5, 'Authorizing card payment...');
      await this.delay(800);
    } else {
      yield io.emit.progress(0.5, 'Securing order allocation...');
      await this.delay(600);
    }

    yield io.emit.progress(0.8, 'Sending to kitchen...');
    await this.delay(600);

    yield io.emit.progress(1.0, 'Order confirmed!');

    const orderNumber = `PZZ-${Date.now().toString(36).toUpperCase()}`;
    const etaMin = orderType === 'delivery' ? 35 : 15;
    const eta = new Date(Date.now() + etaMin * 60 * 1000);
    const etaStr = eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const finalReceipt = this.formatCartAsBill('Order Confirmed!', {
      orderNumber,
      orderType: orderType === 'delivery' ? 'Delivery' : 'Pickup',
      paymentMethod: paymentMethod === 'card' ? 'Credit Card' : (orderType === 'pickup' ? 'Pay on Pickup' : 'Cash on Delivery'),
      etaStr,
      customerName,
      customerPhone,
      deliveryAddress: addressStr,
      instructions
    });

    // Clear cart
    this.cart = [];

    yield io.emit.toast('🎉 Order placed successfully!', 'success');

    return finalReceipt;
  }

  /**
   * Get cart status
   * @autorun
   * @format kv
   */
  async cartStatus() {
    const itemCount = this.cart.reduce((sum, i) => sum + i.quantity, 0);
    const total = this.calculateTotal();

    if (itemCount === 0) {
      return {
        '🛒 Status': 'Empty',
        '💰 Total': '$0.00'
      };
    }

    return {
      '🛒 Total Items': itemCount,
      '💰 Subtotal': `$${total.toFixed(2)}`,
      '🍕 In Cart': this.cart.map(i => {
        const toppingsStr = i.extraToppings.length > 0 ? ` (+${i.extraToppings.join(', ')})` : '';
        return `${i.quantity}x ${i.pizza.name} (${i.size.charAt(0).toUpperCase() + i.size.slice(1)})${toppingsStr}`;
      }).join(', ')
    };
  }

  // Helper methods
  private calculateItemPrice(item: OrderItem): number {
    const basePrice = item.pizza.price * SIZE_MULTIPLIERS[item.size];
    const toppingsCost = item.extraToppings.reduce((sum, tId) => {
      const topping = this.extraToppings.find(t => t.id === tId);
      return sum + (topping?.price || 0);
    }, 0);
    return (basePrice + toppingsCost) * item.quantity;
  }

  private calculateTotal(): number {
    return this.cart.reduce((sum, item) => sum + this.calculateItemPrice(item), 0);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private formatCartAsBill(
    title: string,
    extraFields?: {
      deliveryAddress?: string;
      etaStr?: string;
      instructions?: string;
      orderNumber?: string;
      customerName?: string;
      customerPhone?: string;
      orderType?: 'Delivery' | 'Pickup';
      paymentMethod?: string;
    }
  ): string {
    const subtotal = this.calculateTotal();
    const isDelivery = extraFields?.orderType !== 'Pickup';
    const deliveryFee = this.cart.length > 0 && isDelivery ? 3.99 : 0;
    const tax = subtotal * 0.08;
    const total = subtotal > 0 ? subtotal + deliveryFee + tax : 0;
    const orderDate = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });

    let bill = `### 🍕 ${title}\n\n`;
    bill += `\`\`\`text\n`;
    bill += `========================================\n`;
    bill += `              PIZZA SHOP                \n`;
    bill += `        - Freshly Baked For You -       \n`;
    bill += `========================================\n`;
    if (extraFields?.orderNumber) {
      bill += `Order ID:  ${extraFields.orderNumber}\n`;
    }
    bill += `Date:      ${orderDate}\n`;
    if (extraFields?.orderType) {
      bill += `Type:      ${extraFields.orderType}\n`;
    }
    if (extraFields?.paymentMethod) {
      bill += `Payment:   ${extraFields.paymentMethod}\n`;
    }
    if (extraFields?.customerName) {
      bill += `Customer:  ${extraFields.customerName}\n`;
    }
    if (extraFields?.customerPhone) {
      bill += `Phone:     ${extraFields.customerPhone}\n`;
    }
    bill += `----------------------------------------\n`;
    bill += `Qty  Item`.padEnd(30) + `Price`.padStart(10) + `\n`;
    bill += `----------------------------------------\n`;

    if (this.cart.length === 0) {
      bill += `         [ Cart is empty ]              \n`;
    } else {
      for (const item of this.cart) {
        const baseName = `${item.pizza.name} (${item.size.charAt(0).toUpperCase() + item.size.slice(1)})`;
        const price = this.calculateItemPrice({ ...item, extraToppings: [] });
        
        const qtyStr = `${item.quantity}`.padStart(2);
        const nameStr = baseName.padEnd(25).slice(0, 25);
        const priceStr = `$${price.toFixed(2)}`.padStart(10);
        bill += ` ${qtyStr}  ${nameStr}${priceStr}\n`;

        if (item.extraToppings.length > 0) {
          for (const tId of item.extraToppings) {
            const topping = this.extraToppings.find(t => t.id === tId);
            if (topping) {
              const toppingName = `+ ${topping.name}`;
              const topPriceStr = `$${(topping.price * item.quantity).toFixed(2)}`.padStart(10);
              bill += `     ${toppingName.padEnd(25).slice(0, 25)}${topPriceStr}\n`;
            }
          }
        }
      }
    }

    bill += `----------------------------------------\n`;
    bill += `Subtotal:`.padEnd(30) + `$${subtotal.toFixed(2)}`.padStart(10) + `\n`;
    if (total > 0) {
      if (isDelivery) {
        bill += `Delivery Fee:`.padEnd(30) + `$${deliveryFee.toFixed(2)}`.padStart(10) + `\n`;
      }
      bill += `Tax (8%):`.padEnd(30) + `$${tax.toFixed(2)}`.padStart(10) + `\n`;
    }
    bill += `========================================\n`;
    bill += `TOTAL:`.padEnd(30) + `$${total.toFixed(2)}`.padStart(10) + `\n`;
    bill += `========================================\n`;
    
    if (extraFields?.deliveryAddress) {
      const addressLabel = extraFields.orderType === 'Pickup' ? 'Pickup Location' : 'Delivery Address';
      bill += `${addressLabel}:\n`;
      bill += `${extraFields.deliveryAddress}\n`;
      bill += `----------------------------------------\n`;
    }
    if (extraFields?.instructions) {
      const noteLabel = extraFields.orderType === 'Pickup' ? 'Time' : 'Note';
      bill += `${noteLabel}: ${extraFields.instructions}\n`;
      bill += `----------------------------------------\n`;
    }
    if (extraFields?.etaStr) {
      const timeLabel = extraFields.orderType === 'Pickup' ? 'Ready by' : 'ETA';
      bill += `${timeLabel}: ${extraFields.etaStr} (approx. ${extraFields.orderType === 'Pickup' ? '15' : '35'} mins)\n`;
      bill += `========================================\n`;
    }
    
    bill += `     Thank you for your order!          \n`;
    bill += `========================================\n`;
    bill += `\`\`\`\n`;

    return bill;
  }
}
