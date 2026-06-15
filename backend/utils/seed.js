import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Banner from '../models/Banner.js';
import Review from '../models/Review.js';
import Order from '../models/Order.js';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yuki-store');
    console.log(`Seed MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Category.deleteMany();
    await Brand.deleteMany();
    await Product.deleteMany();
    await Coupon.deleteMany();
    await Banner.deleteMany();
    await Review.deleteMany();
    await Order.deleteMany();

    console.log('Database wiped clean...');

    const users = await User.create([
      {
        name: 'Yuki Admin',
        email: 'admin@yukistore.com',
        password: 'adminpassword123',
        mobile: '9876543210',
        role: 'admin',
      },
      {
        name: 'Priya Sharma',
        email: 'priya@gmail.com',
        password: 'password123',
        mobile: '9876543211',
        role: 'user',
        addresses: [
          {
            street: '24 Anna Nagar, Block B',
            city: 'Chennai',
            state: 'Tamil Nadu',
            zipCode: '600040',
            country: 'India'
          }
        ]
      }
    ]);

    console.log('Users seeded...');

    const categories = await Category.create([
      {
        name: 'Fruits & Vegetables',
        slug: 'fruits-vegetables',
        description: 'Fresh farm produce delivered daily',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
        active: true
      },
      {
        name: 'Dairy & Eggs',
        slug: 'dairy-eggs',
        description: 'Fresh milk, cheese, butter, and eggs',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80',
        active: true
      },
      {
        name: 'Bakery & Bread',
        slug: 'bakery-bread',
        description: 'Freshly baked breads, cakes, and pastries',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
        active: true
      },
      {
        name: 'Beverages',
        slug: 'beverages',
        description: 'Juices, teas, coffees, and soft drinks',
        image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&auto=format&fit=crop&q=80',
        active: true
      },
      {
        name: 'Snacks & Munchies',
        slug: 'snacks',
        description: 'Chips, biscuits, nuts, and healthy snacks',
        image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600&auto=format&fit=crop&q=80',
        active: true
      },
      {
        name: 'Meat & Seafood',
        slug: 'meat-seafood',
        description: 'Fresh chicken, fish, mutton, and prawns',
        image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&auto=format&fit=crop&q=80',
        active: true
      },
      {
        name: 'Staples & Grains',
        slug: 'staples-grains',
        description: 'Rice, dal, flour, pulses, and cooking oils',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
        active: true
      },
      {
        name: 'Frozen Foods',
        slug: 'frozen-foods',
        description: 'Frozen vegetables, meals, and ice creams',
        image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&auto=format&fit=crop&q=80',
        active: true
      }
    ]);

    console.log('Categories seeded...');

    const brands = await Brand.create([
      { name: 'Amul', slug: 'amul', description: 'The Taste of India', active: true },
      { name: 'Britannia', slug: 'britannia', description: 'Eat Healthy, Think Better', active: true },
      { name: 'Nestlé', slug: 'nestle', description: 'Good Food, Good Life', active: true },
      { name: 'Tata', slug: 'tata', description: 'Trust in Every Sip', active: true },
      { name: 'Organic India', slug: 'organic-india', description: 'Pure & Natural Organic Products', active: true },
      { name: 'Fresh Farms', slug: 'fresh-farms', description: 'Farm Fresh Every Day', active: true },
      { name: 'Haldirams', slug: 'haldirams', description: 'Traditional Indian Snacks', active: true },
      { name: 'ITC', slug: 'itc', description: 'Quality Food Products', active: true },
    ]);

    console.log('Brands seeded...');

    const fruitsCat   = categories.find(c => c.slug === 'fruits-vegetables')._id;
    const dairyCat    = categories.find(c => c.slug === 'dairy-eggs')._id;
    const bakeryCat   = categories.find(c => c.slug === 'bakery-bread')._id;
    const beverageCat = categories.find(c => c.slug === 'beverages')._id;
    const snacksCat   = categories.find(c => c.slug === 'snacks')._id;
    const meatCat     = categories.find(c => c.slug === 'meat-seafood')._id;
    const staplesCat  = categories.find(c => c.slug === 'staples-grains')._id;
    const frozenCat   = categories.find(c => c.slug === 'frozen-foods')._id;

    const amul        = brands.find(b => b.slug === 'amul')._id;
    const britannia   = brands.find(b => b.slug === 'britannia')._id;
    const nestle      = brands.find(b => b.slug === 'nestle')._id;
    const tata        = brands.find(b => b.slug === 'tata')._id;
    const organicIndia= brands.find(b => b.slug === 'organic-india')._id;
    const freshFarms  = brands.find(b => b.slug === 'fresh-farms')._id;
    const haldirams   = brands.find(b => b.slug === 'haldirams')._id;
    const itc         = brands.find(b => b.slug === 'itc')._id;

    await Product.create([
      // Fruits & Vegetables
      {
        name: 'Fresh Organic Bananas',
        slug: 'fresh-organic-bananas-001',
        description: 'Sweet and ripe organic bananas sourced directly from farms. Rich in potassium, natural sugars, and dietary fiber. Perfect for breakfast, smoothies, or a quick snack.',
        price: 60,
        discountPrice: 49,
        brand: freshFarms,
        category: fruitsCat,
        images: ['https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=600&auto=format&fit=crop&q=80'],
        stock: 200,
        sizes: ['500g', '1kg'],
        colors: [],
        featured: true,
        trending: true,
        ratings: { average: 4.7, count: 312 }
      },
      {
        name: 'Red Tomatoes',
        slug: 'red-tomatoes-002',
        description: 'Farm-fresh red tomatoes, juicy and ripe. Ideal for curries, salads, sauces, and chutneys. Packed with vitamin C and antioxidants.',
        price: 40,
        discountPrice: 35,
        brand: freshFarms,
        category: fruitsCat,
        images: ['https://images.unsplash.com/photo-1558818498-28c1e002b655?w=600&auto=format&fit=crop&q=80'],
        stock: 300,
        sizes: ['500g', '1kg', '2kg'],
        colors: [],
        newArrival: true,
        featured: true,
        ratings: { average: 4.5, count: 198 }
      },
      {
        name: 'Fresh Spinach (Palak)',
        slug: 'fresh-spinach-003',
        description: 'Tender, dark green spinach leaves, washed and ready to cook. High in iron, calcium, and vitamins. Great for dal palak, smoothies, and parathas.',
        price: 30,
        discountPrice: 25,
        brand: freshFarms,
        category: fruitsCat,
        images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80'],
        stock: 150,
        sizes: ['250g', '500g'],
        colors: [],
        newArrival: true,
        ratings: { average: 4.4, count: 87 }
      },
      {
        name: 'Royal Gala Apples',
        slug: 'royal-gala-apples-004',
        description: 'Crisp and sweet Royal Gala apples imported from Himachal Pradesh. Naturally sweet with a firm texture. Excellent source of dietary fiber and vitamin C.',
        price: 180,
        discountPrice: 149,
        brand: freshFarms,
        category: fruitsCat,
        images: ['https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&auto=format&fit=crop&q=80'],
        stock: 100,
        sizes: ['500g', '1kg'],
        colors: [],
        featured: true,
        trending: true,
        ratings: { average: 4.8, count: 245 }
      },
      // Dairy & Eggs
      {
        name: 'Amul Gold Full Cream Milk',
        slug: 'amul-gold-full-cream-milk-005',
        description: 'Amul Gold full cream milk with 6% fat content. Rich, creamy and nutritious. Pasteurized and homogenized for freshness. Great for tea, coffee, and drinking.',
        price: 68,
        discountPrice: 0,
        brand: amul,
        category: dairyCat,
        images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80'],
        stock: 500,
        sizes: ['500ml', '1L'],
        colors: [],
        featured: true,
        trending: true,
        ratings: { average: 4.9, count: 876 }
      },
      {
        name: 'Amul Butter',
        slug: 'amul-butter-006',
        description: 'The iconic Amul butter made from fresh cream. Perfect for spreading on bread, cooking, and baking. Salted variety for that classic taste Indians love.',
        price: 58,
        discountPrice: 55,
        brand: amul,
        category: dairyCat,
        images: ['https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&auto=format&fit=crop&q=80'],
        stock: 300,
        sizes: ['100g', '500g'],
        colors: [],
        featured: true,
        newArrival: false,
        ratings: { average: 4.8, count: 1200 }
      },
      {
        name: 'Farm Fresh Eggs (White)',
        slug: 'farm-fresh-eggs-007',
        description: 'Fresh white eggs from free-range hens. Rich in protein and essential amino acids. Collected daily for maximum freshness. Grade A quality certified.',
        price: 90,
        discountPrice: 79,
        brand: freshFarms,
        category: dairyCat,
        images: ['https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=600&auto=format&fit=crop&q=80'],
        stock: 400,
        sizes: ['6 pieces', '12 pieces', '30 pieces'],
        colors: [],
        trending: true,
        ratings: { average: 4.6, count: 543 }
      },
      // Bakery
      {
        name: 'Britannia Whole Wheat Bread',
        slug: 'britannia-wheat-bread-008',
        description: 'Soft whole wheat bread made with goodness of wheat. No maida, no artificial colors. High in fiber and nutrients. Perfect for sandwiches and toast.',
        price: 45,
        discountPrice: 40,
        brand: britannia,
        category: bakeryCat,
        images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80'],
        stock: 200,
        sizes: ['400g', '800g'],
        colors: [],
        featured: true,
        trending: true,
        ratings: { average: 4.5, count: 432 }
      },
      {
        name: 'Britannia Good Day Cookies',
        slug: 'britannia-good-day-cookies-009',
        description: 'Crispy butter cookies with a rich buttery taste and cashew biscuits baked to perfection. The classic Good Day pack loved by families across India.',
        price: 35,
        discountPrice: 30,
        brand: britannia,
        category: bakeryCat,
        images: ['https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop&q=80'],
        stock: 350,
        sizes: ['75g', '150g', '300g'],
        colors: [],
        newArrival: true,
        ratings: { average: 4.7, count: 689 }
      },
      // Beverages
      {
        name: 'Tata Tea Gold',
        slug: 'tata-tea-gold-010',
        description: 'Premium blend of long leaf Assam tea for a rich, aromatic cup. Tata Tea Gold gives you the perfect balance of strength, taste and colour every morning.',
        price: 165,
        discountPrice: 149,
        brand: tata,
        category: beverageCat,
        images: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80'],
        stock: 250,
        sizes: ['250g', '500g', '1kg'],
        colors: [],
        featured: true,
        trending: true,
        ratings: { average: 4.8, count: 934 }
      },
      {
        name: 'Nestlé Milo Energy Drink',
        slug: 'nestle-milo-energy-011',
        description: 'Milo is a malted chocolate drink fortified with vitamins and minerals. Made with cocoa, malt, and milk, it provides energy for an active lifestyle.',
        price: 199,
        discountPrice: 175,
        brand: nestle,
        category: beverageCat,
        images: ['https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&auto=format&fit=crop&q=80'],
        stock: 180,
        sizes: ['200g', '400g', '1kg'],
        colors: [],
        newArrival: true,
        featured: true,
        ratings: { average: 4.6, count: 412 }
      },
      // Snacks
      {
        name: 'Haldirams Aloo Bhujia',
        slug: 'haldirams-aloo-bhujia-012',
        description: 'The classic Haldirams Aloo Bhujia – crispy, spicy and utterly addictive. Made from gram flour and potatoes with authentic Indian spices. A timeless snack.',
        price: 50,
        discountPrice: 45,
        brand: haldirams,
        category: snacksCat,
        images: ['https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600&auto=format&fit=crop&q=80'],
        stock: 500,
        sizes: ['150g', '400g', '1kg'],
        colors: [],
        trending: true,
        featured: true,
        ratings: { average: 4.9, count: 1542 }
      },
      {
        name: 'Organic India Tulsi Green Tea',
        slug: 'organic-india-tulsi-green-tea-013',
        description: 'A refreshing blend of organic tulsi and green tea. Rich in antioxidants, calming and energizing. Caffeine-free option available. Certified organic by USDA.',
        price: 180,
        discountPrice: 155,
        brand: organicIndia,
        category: snacksCat,
        images: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80'],
        stock: 150,
        sizes: ['25 bags', '50 bags', '100 bags'],
        colors: [],
        newArrival: true,
        ratings: { average: 4.7, count: 289 }
      },
      // Staples
      {
        name: 'India Gate Basmati Rice',
        slug: 'india-gate-basmati-rice-014',
        description: 'Premium aged basmati rice with long, slender grains and a heavenly aroma. Each grain cooks separately and stays fluffy. Perfect for biryani, pulao, and daily meals.',
        price: 299,
        discountPrice: 259,
        brand: itc,
        category: staplesCat,
        images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80'],
        stock: 300,
        sizes: ['1kg', '5kg', '10kg', '25kg'],
        colors: [],
        featured: true,
        trending: true,
        ratings: { average: 4.8, count: 1876 }
      },
      {
        name: 'Tata Salt Lite',
        slug: 'tata-salt-lite-015',
        description: 'Tata Salt Lite with 15% less sodium — for health-conscious families. Iodised and purified for quality assurance. The trusted salt brand of India.',
        price: 28,
        discountPrice: 25,
        brand: tata,
        category: staplesCat,
        images: ['https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=600&auto=format&fit=crop&q=80'],
        stock: 600,
        sizes: ['1kg', '2kg'],
        colors: [],
        trending: true,
        ratings: { average: 4.6, count: 2341 }
      },
      // Meat
      {
        name: 'Fresh Chicken Breast (Boneless)',
        slug: 'fresh-chicken-breast-016',
        description: 'Premium fresh boneless chicken breast, cleaned and hygienically packed. High in protein, low in fat. Antibiotic-free and sourced from certified farms.',
        price: 280,
        discountPrice: 249,
        brand: freshFarms,
        category: meatCat,
        images: ['https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&auto=format&fit=crop&q=80'],
        stock: 100,
        sizes: ['500g', '1kg'],
        colors: [],
        newArrival: true,
        featured: true,
        ratings: { average: 4.5, count: 378 }
      },
      // Frozen
      {
        name: 'McCain French Fries',
        slug: 'mccain-french-fries-017',
        description: 'Crispy golden french fries made from premium potatoes. Ready in minutes — just air fry or bake. No artificial colours or flavours. The whole family favourite.',
        price: 160,
        discountPrice: 135,
        brand: nestle,
        category: frozenCat,
        images: ['https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80'],
        stock: 200,
        sizes: ['400g', '800g'],
        colors: [],
        trending: true,
        newArrival: true,
        ratings: { average: 4.6, count: 654 }
      },
      {
        name: 'Amul Ice Cream Vanilla',
        slug: 'amul-ice-cream-vanilla-018',
        description: 'Rich and creamy vanilla ice cream made from Amul\'s premium milk and cream. Real vanilla flavour, smooth texture. The perfect dessert for the whole family.',
        price: 120,
        discountPrice: 99,
        brand: amul,
        category: frozenCat,
        images: ['https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&auto=format&fit=crop&q=80'],
        stock: 150,
        sizes: ['500ml', '1L', '2L'],
        colors: [],
        featured: true,
        ratings: { average: 4.7, count: 892 }
      }
    ]);

    console.log('Products seeded...');

    await Coupon.create([
      { code: 'YUKI10', discountType: 'Percentage', discountAmount: 10, minPurchase: 500, expiryDate: new Date('2027-12-31'), active: true },
      { code: 'FRESH50', discountType: 'Fixed', discountAmount: 50, minPurchase: 300, expiryDate: new Date('2027-12-31'), active: true },
      { code: 'FIRSTORDER', discountType: 'Percentage', discountAmount: 20, minPurchase: 200, expiryDate: new Date('2027-12-31'), active: true },
    ]);

    console.log('Coupons seeded...');

    await Banner.create([
      {
        title: 'Fresh Groceries, Delivered Fast!',
        subtitle: 'Order fresh fruits, vegetables, dairy and more — delivered to your door in hours',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1400&auto=format&fit=crop&q=80',
        link: '/shop',
        type: 'hero',
        active: true
      },
      {
        title: 'Organic & Natural Products',
        subtitle: 'Shop our curated range of certified organic groceries for a healthier you',
        image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1400&auto=format&fit=crop&q=80',
        link: '/shop?category=fruits-vegetables',
        type: 'hero',
        active: true
      },
      {
        title: 'Dairy Deals This Week',
        subtitle: 'Up to 20% off on Amul, Britannia and more dairy products',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&auto=format&fit=crop&q=80',
        link: '/shop?category=dairy-eggs',
        type: 'offer',
        active: true
      }
    ]);

    console.log('Banners seeded...');
    console.log('\n✅ YUKI_STORE Seed Completed Successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Admin:   admin@yukistore.com / adminpassword123');
    console.log('👤 User:    priya@gmail.com     / password123');
    console.log('🏷️  Coupons: YUKI10, FRESH50, FIRSTORDER');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('Seeding Error:', error);
  } finally {
    mongoose.disconnect();
  }
};

seedData();
