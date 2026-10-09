package com.jayasrimart.e_commerce.config;

import com.jayasrimart.e_commerce.entity.*;
import com.jayasrimart.e_commerce.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CouponRepository couponRepository;
    private final CartRepository cartRepository;
    private final WishlistRepository wishlistRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      CategoryRepository categoryRepository,
                      BrandRepository brandRepository,
                      ProductRepository productRepository,
                      ProductImageRepository productImageRepository,
                      ProductVariantRepository productVariantRepository,
                      CouponRepository couponRepository,
                      CartRepository cartRepository,
                      WishlistRepository wishlistRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.productVariantRepository = productVariantRepository;
        this.couponRepository = couponRepository;
        this.cartRepository = cartRepository;
        this.wishlistRepository = wishlistRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedCategoriesAndBrandsAndProducts();
        seedCoupons();
        log.info("JayasriMart Data Seeder execution completed successfully.");
    }

    private void seedUsers() {
        if (!userRepository.existsByEmail("admin@jayasrimart.com")) {
            User admin = new User();
            admin.setFirstName("Jayasri");
            admin.setLastName("Admin");
            admin.setEmail("admin@jayasrimart.com");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setPhone("+91 98765 43210");
            admin.setRole(Role.ADMIN);
            admin.setStatus(UserStatus.ACTIVE);
            admin = userRepository.save(admin);

            cartRepository.save(new Cart(admin));
            wishlistRepository.save(new Wishlist(admin));
            log.info("Seeded default Admin: admin@jayasrimart.com / Admin@123");
        }

        if (!userRepository.existsByEmail("customer@jayasrimart.com")) {
            User customer = new User();
            customer.setFirstName("Priya");
            customer.setLastName("Sharma");
            customer.setEmail("customer@jayasrimart.com");
            customer.setPassword(passwordEncoder.encode("Customer@123"));
            customer.setPhone("+91 98765 12345");
            customer.setRole(Role.CUSTOMER);
            customer.setStatus(UserStatus.ACTIVE);
            customer = userRepository.save(customer);

            cartRepository.save(new Cart(customer));
            wishlistRepository.save(new Wishlist(customer));
            log.info("Seeded default Customer: customer@jayasrimart.com / Customer@123");
        }
    }

    private void seedCategoriesAndBrandsAndProducts() {
        if (categoryRepository.count() > 0 && productRepository.count() > 0) {
            return;
        }

        // Categories
        Category electronics = saveCategory("Electronics", "electronics", "Latest gadgets, smartphones, laptops, audio, and personal devices.",
                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80");
        Category fashion = saveCategory("Fashion", "fashion", "Trendy clothing, footwear, and apparel for men, women, and kids.",
                "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop&q=80");
        Category home = saveCategory("Home & Kitchen", "home-kitchen", "Premium home appliances, kitchenware, furniture, and decor.",
                "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80");
        Category beauty = saveCategory("Beauty", "beauty", "Skincare, haircare, luxury perfumes, and personal grooming essentials.",
                "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80");
        Category sports = saveCategory("Sports", "sports", "Fitness equipment, sportswear, outdoor gear, and athletic accessories.",
                "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80");
        Category books = saveCategory("Books", "books", "Bestselling novels, self-improvement books, academic guides, and literature.",
                "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80");
        Category grocery = saveCategory("Grocery", "grocery", "Daily essentials, gourmet foods, organic staples, and fresh beverages.",
                "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80");
        Category accessories = saveCategory("Accessories", "accessories", "Watches, sunglasses, smart bands, wallets, and bags.",
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80");

        // Brands
        Brand apple = saveBrand("Apple", "apple", "Think different. Cutting edge consumer electronics and software.", "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&auto=format&fit=crop&q=80");
        Brand samsung = saveBrand("Samsung", "samsung", "Do what you can't. Global leader in smartphones and appliances.", "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&auto=format&fit=crop&q=80");
        Brand sony = saveBrand("Sony", "sony", "Be moved. Industry leading audio, cameras, and gaming entertainment.", "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&auto=format&fit=crop&q=80");
        Brand nike = saveBrand("Nike", "nike", "Just do it. Iconic athletic footwear, clothing, and sports accessories.", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80");
        Brand adidas = saveBrand("Adidas", "adidas", "Impossible is nothing. Global sportswear and streetwear footwear.", "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=200&auto=format&fit=crop&q=80");
        Brand philips = saveBrand("Philips", "philips", "Innovation and you. Health tech and smart home appliances.", "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200&auto=format&fit=crop&q=80");
        Brand jayasriChoice = saveBrand("Jayasri Basics", "jayasri-basics", "JayasriMart's curated in-house essentials offering supreme quality.", "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&auto=format&fit=crop&q=80");
        Brand penguin = saveBrand("Penguin Books", "penguin-books", "World renowned publishers of timeless literature and bestsellers.", "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80");

        // 22 Demo Products Spread Across Categories
        createSeedProduct("Apple iPhone 15 Pro Max", "apple-iphone-15-pro-max", "JM-ELEC-001",
                "Titanium design with A17 Pro chip, customizable Action button, and the most versatile iPhone camera system yet with 5x optical zoom.",
                "6.7-inch Super Retina XDR display with ProMotion and Always-On.",
                new BigDecimal("159900.00"), new BigDecimal("148900.00"), 25, electronics, apple,
                "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=700&auto=format&fit=crop&q=80",
                true,
                Arrays.asList(
                        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=700&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=700&auto=format&fit=crop&q=80"
                ),
                Arrays.asList(
                        new VariantData("Color", "Natural Titanium", BigDecimal.ZERO, 10, "JM-ELEC-001-NT"),
                        new VariantData("Color", "Blue Titanium", BigDecimal.ZERO, 15, "JM-ELEC-001-BT")
                ));

        createSeedProduct("Samsung Galaxy S24 Ultra 5G", "samsung-galaxy-s24-ultra-5g", "JM-ELEC-002",
                "Galaxy AI is here. Search like never before, get quick language translation on a call, convert voice recordings to text, and effortlessly edit your photos.",
                "Snapdragon 8 Gen 3 with built-in S Pen and Quad Telephoto camera.",
                new BigDecimal("129999.00"), new BigDecimal("119999.00"), 30, electronics, samsung,
                "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=700&auto=format&fit=crop&q=80",
                true, null, null);

        createSeedProduct("Sony WH-1000XM5 Wireless Headphones", "sony-wh-1000xm5-headphones", "JM-ELEC-003",
                "Industry-leading noise cancellation with two processors and eight microphones. Magnificent sound quality engineered to perfection with 30-hour battery life.",
                "Auto NC Optimizer and crystal clear hands-free calling.",
                new BigDecimal("34990.00"), new BigDecimal("28990.00"), 40, electronics, sony,
                "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=700&auto=format&fit=crop&q=80",
                true, null, null);

        createSeedProduct("Apple MacBook Air M3 15-inch", "apple-macbook-air-m3", "JM-ELEC-004",
                "Lean, mean, M3 machine. Strikingly thin design with up to 18 hours of battery life and liquid retina display.",
                "Supercharged by the next-generation M3 chip.",
                new BigDecimal("134900.00"), new BigDecimal("124900.00"), 18, electronics, apple,
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&auto=format&fit=crop&q=80",
                true, null, null);

        createSeedProduct("Nike Air Max 270 React", "nike-air-max-270-react", "JM-FASH-001",
                "The Nike Air Max 270 React combines Nike's biggest heel Air unit with lightweight, springy React foam for non-stop cushioning.",
                "Lightweight, layered no-sew materials create a modern style.",
                new BigDecimal("12995.00"), new BigDecimal("9995.00"), 50, fashion, nike,
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&auto=format&fit=crop&q=80",
                true,
                Arrays.asList(
                        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=700&auto=format&fit=crop&q=80"
                ),
                Arrays.asList(
                        new VariantData("Size", "UK 8", BigDecimal.ZERO, 20, "JM-FASH-001-8"),
                        new VariantData("Size", "UK 9", BigDecimal.ZERO, 20, "JM-FASH-001-9"),
                        new VariantData("Size", "UK 10", BigDecimal.ZERO, 10, "JM-FASH-001-10")
                ));

        createSeedProduct("Adidas Ultraboost Light Running Shoes", "adidas-ultraboost-light", "JM-FASH-002",
                "Experience epic energy with the new Ultraboost Light, our lightest Ultraboost ever made with 30% lighter BOOST material.",
                "Continental Better Rubber outsole provides extraordinary traction.",
                new BigDecimal("17999.00"), new BigDecimal("14999.00"), 35, fashion, adidas,
                "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=700&auto=format&fit=crop&q=80",
                true, null, null);

        createSeedProduct("Classic Tailored Oxford Cotton Shirt", "classic-oxford-cotton-shirt", "JM-FASH-003",
                "Crafted from 100% long-staple Egyptian cotton. Features a button-down collar, box pleat for comfort, and reinforced seams.",
                "Breathable, wrinkle-resistant premium Oxford weave.",
                new BigDecimal("2999.00"), new BigDecimal("1899.00"), 65, fashion, jayasriChoice,
                "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=700&auto=format&fit=crop&q=80",
                false, null,
                Arrays.asList(
                        new VariantData("Size", "M", BigDecimal.ZERO, 30, "JM-FASH-003-M"),
                        new VariantData("Size", "L", BigDecimal.ZERO, 35, "JM-FASH-003-L")
                ));

        createSeedProduct("Philips Air Fryer XXL 7.2L Connected", "philips-air-fryer-xxl", "JM-HOME-001",
                "Rapid CombiAir technology cooks crispy, tender, and healthy food with up to 90% less fat. Connects via NutriU app for automated recipes.",
                "Large 7.2L capacity cooks up to 6 portions easily.",
                new BigDecimal("18995.00"), new BigDecimal("14499.00"), 20, home, philips,
                "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=700&auto=format&fit=crop&q=80",
                true, null, null);

        createSeedProduct("Non-Stick Granite Cookware Set (5-Piece)", "granite-cookware-set-5pc", "JM-HOME-002",
                "Heavy-gauge cast aluminum body heats rapidly and evenly without hot spots. 100% PFOA and PTFE free mineral granite coating.",
                "Includes fry pan, saucepan with lid, saute pan, and kadai.",
                new BigDecimal("7999.00"), new BigDecimal("4499.00"), 45, home, jayasriChoice,
                "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=700&auto=format&fit=crop&q=80",
                false, null, null);

        createSeedProduct("Nespresso Essenza Mini Espresso Maker", "nespresso-essenza-mini", "JM-HOME-003",
                "Ultra-compact footprint delivering authentic barista espresso with a 19-bar high-pressure extraction pump.",
                "One-touch operation with Espresso and Lungo volume options.",
                new BigDecimal("14999.00"), new BigDecimal("11999.00"), 15, home, philips,
                "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=700&auto=format&fit=crop&q=80",
                false, null, null);

        createSeedProduct("Hydrating Hyaluronic Acid Serum 50ml", "hyaluronic-acid-serum-50ml", "JM-BEAUTY-001",
                "Multi-molecular hyaluronic acid delivers deep-layer hydration, plumping fine lines and leaving radiant, glowing skin all day.",
                "Alcohol-free, fragrance-free, dermatologically tested.",
                new BigDecimal("1499.00"), new BigDecimal("899.00"), 80, beauty, jayasriChoice,
                "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=700&auto=format&fit=crop&q=80",
                true, null, null);

        createSeedProduct("Luxury Eau De Parfum Woody Oud 100ml", "luxury-woody-oud-edp-100ml", "JM-BEAUTY-002",
                "Exquisite oriental scent featuring rare agarwood, cardamom, rosewood, and amber notes. Formulated to last over 14 hours.",
                "Sensual, opulent aroma crafted by master perfumers.",
                new BigDecimal("6999.00"), new BigDecimal("4499.00"), 30, beauty, jayasriChoice,
                "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=700&auto=format&fit=crop&q=80",
                false, null, null);

        createSeedProduct("Adjustable Dumbbell Set (2.5kg - 24kg)", "adjustable-dumbbell-set", "JM-SPORT-001",
                "Replaces 15 pairs of traditional weights with a simple turn of a dial. Engineered with durable thermoplastic and heavy steel plates.",
                "Space-saving home gym essential with rapid weight selection.",
                new BigDecimal("19999.00"), new BigDecimal("14999.00"), 12, sports, nike,
                "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=700&auto=format&fit=crop&q=80",
                true, null, null);

        createSeedProduct("Eco-Friendly Non-Slip Yoga Mat 6mm", "eco-friendly-yoga-mat", "JM-SPORT-002",
                "High-density dual-textured TPE provides optimal cushioning for spine, hips, knees, and elbows on hard floor surfaces.",
                "Laser-engraved alignment lines and waterproof surface.",
                new BigDecimal("2499.00"), new BigDecimal("1299.00"), 75, sports, adidas,
                "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=700&auto=format&fit=crop&q=80",
                false, null, null);

        createSeedProduct("Atomic Habits by James Clear", "atomic-habits-james-clear", "JM-BOOK-001",
                "No matter your goals, Atomic Habits offers a proven framework for improving--every day. World's #1 bestseller on habit formation.",
                "Paperback, definitive guide on small changes and remarkable results.",
                new BigDecimal("799.00"), new BigDecimal("499.00"), 120, books, penguin,
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=700&auto=format&fit=crop&q=80",
                true, null, null);

        createSeedProduct("The Psychology of Money by Morgan Housel", "psychology-of-money", "JM-BOOK-002",
                "Timeless lessons on wealth, greed, and happiness doing well with money isn't necessarily about what you know. It's about how you behave.",
                "19 short stories exploring the strange ways people think about money.",
                new BigDecimal("499.00"), new BigDecimal("349.00"), 90, books, penguin,
                "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=700&auto=format&fit=crop&q=80",
                true, null, null);

        createSeedProduct("Organic Royal Kashmiri Saffron 5g", "organic-kashmiri-saffron-5g", "JM-GROC-001",
                "100% pure Grade-A Mongra Kashmiri saffron stigmas known for unmatched aroma, intense crimson color, and rich flavor.",
                "Vacuum sealed directly from the valleys of Pampore.",
                new BigDecimal("1999.00"), new BigDecimal("1499.00"), 40, grocery, jayasriChoice,
                "https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=700&auto=format&fit=crop&q=80",
                false, null, null);

        createSeedProduct("Cold-Pressed Extra Virgin Olive Oil 1L", "extra-virgin-olive-oil-1l", "JM-GROC-002",
                "Extracted from Mediterranean olives within 24 hours of harvest. Rich in antioxidants and healthy monounsaturated fats.",
                "First cold pressed with low acidity below 0.5%.",
                new BigDecimal("1599.00"), new BigDecimal("1199.00"), 50, grocery, jayasriChoice,
                "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=700&auto=format&fit=crop&q=80",
                false, null, null);

        createSeedProduct("Apple Watch Series 9 GPS 45mm", "apple-watch-series-9-45mm", "JM-ACC-001",
                "Powered by the S9 SiP chip with Double Tap gesture, brighter display, and precision finding for iPhone.",
                "Advanced health sensors for ECG, heart rate, and temperature sensing.",
                new BigDecimal("44900.00"), new BigDecimal("39900.00"), 22, accessories, apple,
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80",
                true, null, null);

        createSeedProduct("Aviator Polarized Sunglasses Classic Gold", "aviator-polarized-sunglasses", "JM-ACC-002",
                "Full-metal lightweight frame with green G-15 polarized crystal lenses. 100% UV400 protection against harmful rays.",
                "Timeless teardrop style with comfortable silicone nose pads.",
                new BigDecimal("4999.00"), new BigDecimal("2499.00"), 35, accessories, jayasriChoice,
                "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=700&auto=format&fit=crop&q=80",
                false, null, null);

        createSeedProduct("Genuine Leather Slim Bi-Fold Wallet", "leather-slim-bifold-wallet", "JM-ACC-003",
                "Handcrafted from full-grain vegetable-tanned leather with RFID-blocking lining to protect your cards from electronic theft.",
                "Holds 8-10 cards plus full-length cash compartment.",
                new BigDecimal("1899.00"), new BigDecimal("999.00"), 60, accessories, jayasriChoice,
                "https://images.unsplash.com/photo-1627123424574-724758594e93?w=700&auto=format&fit=crop&q=80",
                false, null, null);

        createSeedProduct("Ergonomic Mesh Office Chair with Lumbar Support", "ergonomic-mesh-office-chair", "JM-HOME-004",
                "Breathable mesh backrest, pneumatic height adjustment, 3D armrests, and dynamic self-adjusting lumbar support.",
                "Engineered for all-day posture comfort and productivity.",
                new BigDecimal("15999.00"), new BigDecimal("10999.00"), 8, home, jayasriChoice,
                "https://images.unsplash.com/photo-1580481077195-c3a9a3220978?w=700&auto=format&fit=crop&q=80",
                true, null, null);

        log.info("Seeded 8 Categories, 8 Brands, and 22 Demo Products for JayasriMart.");
    }

    private void seedCoupons() {
        if (couponRepository.count() > 0) return;

        Coupon c1 = new Coupon("WELCOME10", "Get 10% off on your first order at JayasriMart!",
                DiscountType.PERCENTAGE, new BigDecimal("10.00"), new BigDecimal("299.00"), new BigDecimal("500.00"),
                LocalDateTime.now().minusDays(1), LocalDateTime.now().plusMonths(6), 1000);
        couponRepository.save(c1);

        Coupon c2 = new Coupon("JAYASRI50", "Flat ₹50 instant discount on orders above ₹499",
                DiscountType.FIXED, new BigDecimal("50.00"), new BigDecimal("499.00"), null,
                LocalDateTime.now().minusDays(1), LocalDateTime.now().plusMonths(12), 5000);
        couponRepository.save(c2);

        Coupon c3 = new Coupon("SUPERDEAL", "Huge 20% discount on orders above ₹2000!",
                DiscountType.PERCENTAGE, new BigDecimal("20.00"), new BigDecimal("2000.00"), new BigDecimal("2000.00"),
                LocalDateTime.now().minusDays(1), LocalDateTime.now().plusMonths(3), 500);
        couponRepository.save(c3);

        log.info("Seeded coupons: WELCOME10, JAYASRI50, SUPERDEAL");
    }

    private Category saveCategory(String name, String slug, String desc, String img) {
        return categoryRepository.findBySlug(slug).orElseGet(() -> {
            Category c = new Category(name, slug, desc, img);
            return categoryRepository.save(c);
        });
    }

    private Brand saveBrand(String name, String slug, String desc, String logo) {
        return brandRepository.findBySlug(slug).orElseGet(() -> {
            Brand b = new Brand(name, slug, desc, logo);
            return brandRepository.save(b);
        });
    }

    private void createSeedProduct(String name, String slug, String sku, String desc, String shortDesc,
                                   BigDecimal price, BigDecimal discountPrice, int stock,
                                   Category category, Brand brand, String imageUrl, boolean featured,
                                   List<String> gallery, List<VariantData> variants) {
        if (productRepository.existsBySku(sku) || productRepository.existsBySlug(slug)) {
            return;
        }

        Product p = new Product();
        p.setName(name);
        p.setSlug(slug);
        p.setSku(sku);
        p.setDescription(desc);
        p.setShortDescription(shortDesc);
        p.setPrice(price);
        p.setDiscountPrice(discountPrice);
        p.setStockQuantity(stock);
        p.setCategory(category);
        p.setBrand(brand);
        p.setImageUrl(imageUrl);
        p.setActive(true);
        p.setFeatured(featured);

        p = productRepository.save(p);

        if (gallery != null) {
            int order = 0;
            for (String g : gallery) {
                productImageRepository.save(new ProductImage(p, g, order++));
            }
        }

        if (variants != null) {
            for (VariantData vd : variants) {
                productVariantRepository.save(new ProductVariant(p, vd.name, vd.value, vd.extraPrice, vd.stock, vd.sku));
            }
        }
    }

    private static class VariantData {
        String name;
        String value;
        BigDecimal extraPrice;
        int stock;
        String sku;

        VariantData(String name, String value, BigDecimal extraPrice, int stock, String sku) {
            this.name = name;
            this.value = value;
            this.extraPrice = extraPrice;
            this.stock = stock;
            this.sku = sku;
        }
    }
}
