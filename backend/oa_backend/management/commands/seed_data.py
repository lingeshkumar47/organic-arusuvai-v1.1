from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Create default admin and customer users, and seed sample data'

    def handle(self, *args, **options):
        # --- Create Admin User ---
        if not User.objects.filter(username='masteradmin').exists():
            admin = User.objects.create_superuser(
                username='masteradmin',
                email='admin@organicarusuvai.online',
                password='masteradmin123',
                first_name='Master',
                last_name='Admin',
                role='admin',
                phone='+91 98765 43210',
            )
            self.stdout.write(self.style.SUCCESS(f'✅ Admin user created: masteradmin / masteradmin123'))
        else:
            self.stdout.write(self.style.WARNING('⚠️  Admin user "masteradmin" already exists'))

        # --- Create Customer User ---
        if not User.objects.filter(username='customer').exists():
            customer = User.objects.create_user(
                username='customer',
                email='customer@organicarusuvai.online',
                password='customer123',
                first_name='Test',
                last_name='Customer',
                role='customer',
                phone='+91 99999 11111',
            )
            self.stdout.write(self.style.SUCCESS(f'✅ Customer user created: customer / customer123'))
        else:
            self.stdout.write(self.style.WARNING('⚠️  Customer user "customer" already exists'))

        # --- Seed Categories ---
        from products.models import Category, Product, ProductVariant, ProductImage
        from marketing.models import Banner

        categories_data = [
            {'name': 'Spices', 'slug': 'spices', 'description': 'Authentic Indian spices sourced from organic farms', 'image': '/static/cat-spices.jpg'},
            {'name': 'Farm Products', 'slug': 'farm-products', 'description': 'Fresh produce directly from certified organic farms', 'image': '/static/cat-farm.jpg'},
            {'name': 'Ready Mixes', 'slug': 'ready-mixes', 'description': 'Traditional recipes made easy with organic ingredients', 'image': '/static/cat-mixes.jpg'},
            {'name': 'Millets', 'slug': 'millets', 'description': 'Ancient supergrains for modern healthy living', 'image': '/static/cat-millets.jpg'},
            {'name': 'Cold Pressed Oils', 'slug': 'cold-pressed-oils', 'description': 'Stone-ground, chemical-free cooking oils', 'image': '/static/cat-oils.jpg'},
        ]

        for i, cd in enumerate(categories_data):
            cat, created = Category.objects.get_or_create(slug=cd['slug'], defaults={**cd, 'sort_order': i})
            if created:
                self.stdout.write(self.style.SUCCESS(f'  📂 Category: {cat.name}'))

        # --- Seed Products ---
        products_data = [
            {'name': 'Organic Turmeric Powder', 'category': 'spices', 'base_price': 149, 'discount_price': None, 'is_featured': True,
             'description': 'Premium organic turmeric powder from Tamil Nadu farms. High curcumin content (3-5%). No artificial colors.',
             'variants': [('100g', 79), ('250g', 149), ('500g', 269), ('1kg', 499)]},
            {'name': 'Organic Red Chilli Powder', 'category': 'spices', 'base_price': 129, 'discount_price': None, 'is_featured': True,
             'description': 'Fiery organic red chilli powder. Perfect heat and color for Indian cooking.',
             'variants': [('100g', 69), ('250g', 129), ('500g', 239)]},
            {'name': 'Organic Black Pepper', 'category': 'spices', 'base_price': 199, 'discount_price': None, 'is_featured': True,
             'description': 'Premium Malabar black pepper, hand-picked and sun-dried. Rich aroma.',
             'variants': [('50g', 99), ('100g', 199), ('250g', 449)]},
            {'name': 'Organic Cumin Seeds', 'category': 'spices', 'base_price': 179, 'discount_price': None, 'is_featured': False,
             'description': 'Whole cumin seeds, organically grown. Essential for Indian tempering.',
             'variants': [('100g', 89), ('250g', 179)]},
            {'name': 'Organic Coriander Powder', 'category': 'spices', 'base_price': 109, 'discount_price': None, 'is_featured': False,
             'description': 'Freshly ground coriander powder. Aromatic and flavourful.',
             'variants': [('100g', 59), ('250g', 109), ('500g', 199)]},
            {'name': 'Cold Pressed Coconut Oil', 'category': 'cold-pressed-oils', 'base_price': 349, 'discount_price': None, 'is_featured': True,
             'description': 'Pure virgin coconut oil, cold pressed from fresh coconuts. Traditional wooden press.',
             'variants': [('500ml', 349), ('1L', 649)]},
            {'name': 'Cold Pressed Groundnut Oil', 'category': 'cold-pressed-oils', 'base_price': 279, 'discount_price': None, 'is_featured': True,
             'description': 'Chemical-free groundnut oil. Perfect for deep frying and everyday cooking.',
             'variants': [('500ml', 279), ('1L', 529)]},
            {'name': 'Cold Pressed Sesame Oil', 'category': 'cold-pressed-oils', 'base_price': 319, 'discount_price': None, 'is_featured': False,
             'description': 'Traditional Nallennai (gingelly oil). Stone-ground for maximum nutrition.',
             'variants': [('500ml', 319), ('1L', 599)]},
            {'name': 'Organic Foxtail Millet', 'category': 'millets', 'base_price': 129, 'discount_price': None, 'is_featured': True,
             'description': 'Thinai / Foxtail millet. Rich in iron and dietary fiber.',
             'variants': [('500g', 129), ('1kg', 239)]},
            {'name': 'Organic Ragi Flour', 'category': 'millets', 'base_price': 109, 'discount_price': None, 'is_featured': False,
             'description': 'Finger millet (Ragi) flour. Calcium-rich superfood for all ages.',
             'variants': [('500g', 109), ('1kg', 199)]},
            {'name': 'Organic Little Millet', 'category': 'millets', 'base_price': 139, 'discount_price': None, 'is_featured': False,
             'description': 'Samai / Little Millet. Low glycemic index, perfect for diabetics.',
             'variants': [('500g', 139), ('1kg', 259)]},
            {'name': 'Sambar Powder Mix', 'category': 'ready-mixes', 'base_price': 99, 'discount_price': None, 'is_featured': True,
             'description': 'Authentic Tamil Nadu sambar powder. Homemade recipe with organic spices.',
             'variants': [('100g', 49), ('250g', 99)]},
            {'name': 'Rasam Powder Mix', 'category': 'ready-mixes', 'base_price': 89, 'discount_price': None, 'is_featured': False,
             'description': 'Traditional rasam powder. Aromatic blend for perfect rasam every time.',
             'variants': [('100g', 45), ('250g', 89)]},
            {'name': 'Farm Fresh Jaggery', 'category': 'farm-products', 'base_price': 89, 'discount_price': None, 'is_featured': True,
             'description': 'Nattu sakkarai made from organic sugarcane. No chemicals or sulphur.',
             'variants': [('250g', 49), ('500g', 89), ('1kg', 169)]},
            {'name': 'Organic Wild Honey', 'category': 'farm-products', 'base_price': 299, 'discount_price': None, 'is_featured': True,
             'description': 'Raw, unprocessed honey from wild beehives. Rich in enzymes and antioxidants.',
             'variants': [('250g', 299), ('500g', 549)]},
        ]

        for pd in products_data:
            cat = Category.objects.get(slug=pd['category'])
            product, created = Product.objects.get_or_create(
                slug=pd['name'].lower().replace(' ', '-'),
                defaults={
                    'name': pd['name'], 'category': cat, 'base_price': pd['base_price'],
                    'discount_price': pd['discount_price'], 'is_featured': pd['is_featured'],
                    'description': pd['description'],
                    'seo_title': pd['name'] + ' | Organic Arusuvai',
                    'seo_description': pd['description'][:160],
                }
            )
            if created:
                for vname, vprice in pd['variants']:
                    ProductVariant.objects.create(product=product, name=vname, price=vprice, stock=50,
                                                  sku=f"OA-{product.id}-{vname.replace(' ', '')}")
                self.stdout.write(self.style.SUCCESS(f'  🏷️  Product: {product.name} ({len(pd["variants"])} variants)'))

        # --- Seed Banners ---
        banners_data = [
            {'title': 'Pure Organic Spices', 'subtitle': 'Straight from Indian farms to your kitchen', 'position': 'hero', 'image_url': '/static/hero-1.jpg'},
            {'title': 'Cold Pressed Oils', 'subtitle': 'Traditional stone-ground, chemical-free oils', 'position': 'hero', 'image_url': '/static/hero-2.jpg'},
            {'title': 'Farm Fresh Millets', 'subtitle': 'Ancient grains for modern health', 'position': 'hero', 'image_url': '/static/hero-3.jpg'},
        ]
        for i, bd in enumerate(banners_data):
            Banner.objects.get_or_create(title=bd['title'], defaults={**bd, 'sort_order': i, 'link_url': '/category/all'})

        self.stdout.write(self.style.SUCCESS('\n🎉 Seed data complete!'))
        self.stdout.write(self.style.SUCCESS('   Admin  → masteradmin / masteradmin123'))
        self.stdout.write(self.style.SUCCESS('   Customer → customer / customer123'))
