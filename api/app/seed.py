"""Seed the database with the GreenVolt admin user and realistic sample content.

Run with:  python -m app.seed

Idempotent: existing records are left untouched. The admin account is created
only when ADMIN_EMAIL and ADMIN_PASSWORD are provided via the environment — no
credentials are ever hardcoded.
"""

from __future__ import annotations

import sys
from datetime import date, timedelta
from typing import Any

from sqlalchemy.orm import Session
from sqlmodel import SQLModel, select

from app.core.config import settings
from app.core.security import hash_password
from app.core.slug import slugify
from app.core.text import reading_time
from app.db import engine
from app.models import (
    BlogPost,
    ContactMessage,
    Project,
    Service,
    SiteSetting,
    Testimonial,
    User,
)
from app.models.base import utcnow
from app.models.settings import DEFAULT_SETTING_KEYS
from app.models.user import ROLE_ADMIN


def _seed_admin(db: Session) -> None:
    if not settings.admin_email or not settings.admin_password:
        print("  ! ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin creation.")
        return
    existing = db.execute(
        select(User).where(User.email == settings.admin_email.lower())
    ).scalars().first()
    if existing is not None:
        print("  = admin user already exists.")
        return
    admin = User(
        email=settings.admin_email.lower(),
        full_name=settings.admin_name,
        hashed_password=hash_password(settings.admin_password),
        role=ROLE_ADMIN,
        is_active=True,
    )
    db.add(admin)
    db.commit()
    print(f"  + admin user {admin.email}")


def _seed_services(db: Session) -> None:
    if db.execute(select(Service).limit(1)).scalars().first() is not None:
        print("  = services already seeded.")
        return
    services: list[dict[str, Any]] = [
        {
            "title": "Mobile Repair",
            "title_ur": "موبائل مرمت",
            "summary": "Fast, reliable screen, battery and charging-port repairs for all major brands.",
            "summary_ur": "تمام بڑے برانڈز کے لیے اسکرین، بیٹری اور چارجنگ پورٹ کی تیز مرمت۔",
            "body": (
                "Our technicians repair cracked screens, weak batteries, charging ports, "
                "software faults and water damage for Android and iPhone devices.\n\n"
                "Most common repairs are completed the same day. We use quality parts and "
                "test every device before handing it back.\n\n"
                "- Free diagnosis and honest quote before any work starts\n"
                "- Genuine and premium-grade replacement parts\n"
                "- Up to 3 months service warranty on repairs"
            ),
            "body_ur": (
                "ہمارے ٹیکنیشن android اور iPhone ڈیوائسز کی ٹوٹی اسکرین، کمزور بیٹری، "
                "چارجنگ پورٹ، سافٹ ویئر خرابی اور پانی سے خرابی کی مرمت کرتے ہیں۔\n\n"
                "زیادہ تر مرمت اسی دن مکمل ہو جاتی ہے۔ ہم معیاری پرزے استعمال کرتے ہیں اور "
                "ہر ڈیوائس واپس کرنے سے پہلے ٹیسٹ کرتے ہیں۔"
            ),
            "icon": "smartphone",
            "price_from": 1500,
            "sort_order": 1,
        },
        {
            "title": "Laptop Repair",
            "title_ur": "لیپ ٹاپ مرمت",
            "summary": "Hardware and software repair for laptops — keyboards, screens, batteries and upgrades.",
            "summary_ur": "لیپ ٹاپ کی ہارڈ ویئر اور سافٹ ویئر مرمت — کی بورڈ، اسکرین، بیٹری اور اپ گریڈ۔",
            "body": (
                "We repair laptops of all common brands and handle both hardware and "
                "software problems.\n\n"
                "Whether it is a slow machine, a broken hinge, a dead battery or a new "
                "SSD upgrade, we can help.\n\n"
                "- Screen, keyboard and hinge replacement\n"
                "- SSD and RAM upgrades for faster performance\n"
                "- Windows installation, virus removal and data backup"
            ),
            "icon": "laptop",
            "price_from": 2500,
            "sort_order": 2,
        },
        {
            "title": "Free Home Delivery in Karachi",
            "title_ur": "کراچی میں مفت ہوم ڈیلیوری",
            "summary": "Free delivery across Karachi on qualifying orders — carefully packed and on time.",
            "summary_ur": "اہل آرڈرز پر کراچی بھر میں مفت ڈیلیوری — احتیاط سے پیک اور وقت پر۔",
            "body": (
                "Order any product and we will deliver it to your doorstep anywhere in "
                "Karachi at no extra cost on qualifying purchases.\n\n"
                "- Same-day or next-day delivery on most items\n"
                "- Safe, protected packaging for TVs and large appliances\n"
                "- Cash on delivery available"
            ),
            "icon": "truck",
            "price_from": None,
            "sort_order": 3,
        },
        {
            "title": "1-Year Warranty",
            "title_ur": "ایک سال وارنٹی",
            "summary": "Every new product comes with a full one-year warranty for peace of mind.",
            "summary_ur": "ہر نئی مصنوعات پر مکمل ایک سال کی وارنٹی۔",
            "body": (
                "All new mobiles, laptops, appliances and televisions we sell include a "
                "full one-year warranty.\n\n"
                "If anything goes wrong within the warranty period, bring it to us and we "
                "will handle the claim for you.\n\n"
                "- Written warranty card with every purchase\n"
                "- Help with manufacturer claims\n"
                "- Free check-up during the warranty period"
            ),
            "icon": "shield-check",
            "price_from": None,
            "sort_order": 4,
        },
        {
            "title": "Installment Plans",
            "title_ur": "اقساط کے منصوبے",
            "summary": "Easy monthly installment plans on selected products with simple, transparent terms.",
            "summary_ur": "منتخب مصنوعات پر آسان ماہانہ اقساط، سادہ اور شفاف شرائط کے ساتھ۔",
            "body": (
                "Take home the product you need today and pay in easy monthly "
                "installments.\n\n"
                "Plans are available on selected mobiles, laptops and home appliances.\n\n"
                "- Flexible tenure starting from 3 months\n"
                "- Simple documentation and quick approval\n"
                "- No hidden charges"
            ),
            "icon": "credit-card",
            "price_from": None,
            "sort_order": 5,
        },
        {
            "title": "Home Appliance & TV Sales",
            "title_ur": "گھریلو آلات اور ٹی وی کی فروخت",
            "summary": "Genuine TVs, refrigerators, washing machines, air conditioners and more.",
            "summary_ur": "اصلی ٹی وی، فریج، واشنگ مشین، ایئر کنڈیشنر اور بہت کچھ۔",
            "body": (
                "Browse the latest televisions and home appliances from brands you "
                "trust.\n\n"
                "Our staff will help you choose the right size and features for your home "
                "and budget.\n\n"
                "- LED, QLED and Smart TVs\n"
                "- Refrigerators, washing machines and air conditioners\n"
                "- Setup guidance and after-sales support"
            ),
            "icon": "tv",
            "price_from": None,
            "sort_order": 6,
        },
    ]
    for item in services:
        db.add(Service(slug=slugify(item["title"]), **item))
    db.commit()
    print(f"  + {len(services)} services")


def _seed_projects(db: Session) -> None:
    if db.execute(select(Project).limit(1)).scalars().first() is not None:
        print("  = projects already seeded.")
        return
    projects: list[dict[str, Any]] = [
        {
            "title": "Cafe POS and CCTV Setup",
            "summary": "Supply and installation of a point-of-sale system, receipt printer and four CCTV cameras for a cafe in Saddar.",
            "body": (
                "A busy cafe in Saddar needed a reliable way to take orders and keep an "
                "eye on the counter.\n\n"
                "We supplied a compact POS system with a thermal printer and installed "
                "four CCTV cameras covering the entrance, counter and kitchen.\n\n"
                "The owner can now track daily sales and view live footage from a phone."
            ),
            "client": "Brew & Beans Cafe",
            "completed_at": date(2025, 9, 12),
            "sort_order": 1,
        },
        {
            "title": "Home Theater Installation",
            "summary": "A 65-inch smart TV with wall mounting, soundbar and streaming setup for a family home in DHA.",
            "body": (
                "A family in DHA wanted a clean, cable-free home theater setup.\n\n"
                "We wall-mounted a 65-inch smart TV, configured a soundbar and set up "
                "their streaming accounts, hiding all wiring behind the wall.\n\n"
                "We also walked them through using the universal remote and screen "
                "mirroring from their phones."
            ),
            "client": "Private Residence, DHA",
            "completed_at": date(2025, 8, 3),
            "sort_order": 2,
        },
        {
            "title": "Office Laptop Fleet Refurbishment",
            "summary": "Upgraded 18 office laptops with SSDs and RAM, cleaned fans and reinstalled Windows with Office.",
            "body": (
                "A small accounting office had 18 ageing laptops that had become very "
                "slow.\n\n"
                "Instead of replacing them, we upgraded each machine with an SSD and extra "
                "RAM, cleaned the cooling fans and reinstalled Windows with Office.\n\n"
                "The team reported startup times dropping from minutes to seconds."
            ),
            "client": "Karachi Accounts Firm",
            "completed_at": date(2025, 7, 21),
            "sort_order": 3,
        },
        {
            "title": "Kitchen Appliance Package Delivery",
            "summary": "Delivered and installed a refrigerator, washing machine and microwave for a new apartment.",
            "body": (
                "A customer moving into a new apartment ordered a full kitchen appliance "
                "package.\n\n"
                "We delivered a refrigerator, washing machine and microwave the same day, "
                "installed each appliance and explained basic care and maintenance.\n\n"
                "Everything was covered by the standard one-year warranty."
            ),
            "client": "New Apartment, Gulshan",
            "completed_at": date(2025, 6, 9),
            "sort_order": 4,
        },
        {
            "title": "Bulk Mobile Screen Replacements",
            "summary": "Repaired 12 cracked phone screens for a small courier company within two days.",
            "body": (
                "A courier company brought in 12 phones with cracked screens.\n\n"
                "Our technicians replaced all screens within two days using "
                "premium-grade parts, and each repair carried a three-month service "
                "warranty."
            ),
            "client": "FastDrop Couriers",
            "completed_at": date(2025, 5, 30),
            "sort_order": 5,
        },
    ]
    for item in projects:
        db.add(Project(slug=slugify(item["title"]), **item))
    db.commit()
    print(f"  + {len(projects)} projects")


def _seed_blog(db: Session) -> None:
    if db.execute(select(BlogPost).limit(1)).scalars().first() is not None:
        print("  = blog posts already seeded.")
        return
    now = utcnow()
    posts: list[dict[str, Any]] = [
        {
            "title": "How to Choose the Right Phone for Your Budget",
            "excerpt": "Not sure which mobile to buy? Here is a simple guide to picking a phone that fits your needs and your budget.",
            "body": (
                "Buying a new phone can feel confusing with so many options. Start by "
                "deciding what matters most to you.\n\n"
                "If you mostly use WhatsApp, calls and social media, a mid-range phone "
                "will serve you well. If you play heavy games or take a lot of photos, "
                "look for a better processor and camera.\n\n"
                "- Check the battery capacity for all-day use\n"
                "- Make sure there is enough storage, or a memory card slot\n"
                "- Confirm the phone comes with a warranty card\n\n"
                "Visit our Saddar shop and we will happily compare a few options with you "
                "in simple words."
            ),
            "category": "Buying Guides",
            "tags": ["mobiles", "buying guide"],
            "published_at": now - timedelta(days=18),
        },
        {
            "title": "Five Signs Your Laptop Needs a Service",
            "excerpt": "Slow, hot or noisy? These warning signs mean it is time to bring your laptop in for a check-up.",
            "body": (
                "Laptops rarely fail without warning. Watch for these signs.\n\n"
                "A laptop that takes minutes to start, runs very hot, or whose fan never "
                "stops is usually asking for attention.\n\n"
                "- Startup takes much longer than it used to\n"
                "- The fan is loud or the base gets uncomfortably hot\n"
                "- The battery drains very quickly\n"
                "- Programs freeze or close by themselves\n\n"
                "A simple clean-up and SSD upgrade can often make an old laptop feel new "
                "again at a fraction of the price of a replacement."
            ),
            "category": "Repair Tips",
            "tags": ["laptops", "maintenance"],
            "published_at": now - timedelta(days=11),
        },
        {
            "title": "Understanding Your One-Year Warranty",
            "excerpt": "What your GreenVolt warranty covers, what it does not, and how to make a claim.",
            "body": (
                "Every new product we sell includes a one-year warranty. Here is what that "
                "means in practice.\n\n"
                "Your warranty covers manufacturing defects. If a covered fault appears, "
                "bring the product and your warranty card to our shop.\n\n"
                "- Keep your receipt and warranty card safe\n"
                "- Do not open or modify the product yourself\n"
                "- Bring the product to us and we will handle the manufacturer claim\n\n"
                "Physical damage, water damage and normal wear are not covered, but we can "
                "still repair them at a fair price."
            ),
            "category": "Warranty",
            "tags": ["warranty", "support"],
            "published_at": now - timedelta(days=6),
        },
        {
            "title": "TV Buying Guide for Pakistani Homes",
            "excerpt": "LED, QLED or Smart TV? A practical guide to picking the right screen size and features.",
            "body": (
                "The right TV depends on your room size and how you watch.\n\n"
                "For most living rooms, a 43 to 55-inch screen is comfortable. If you "
                "watch a lot of streaming apps, a Smart TV saves you from buying a "
                "separate device.\n\n"
                "- Measure your viewing distance before choosing a size\n"
                "- Look for at least Full HD, and 4K if your budget allows\n"
                "- Check that the TV supports the streaming apps you use\n\n"
                "We can help you set up the TV and your accounts at home as part of our "
                "free delivery service."
            ),
            "category": "Buying Guides",
            "tags": ["tv", "buying guide"],
            "published_at": now - timedelta(days=3),
        },
        {
            "title": "Protect Your Phone This Monsoon Season",
            "excerpt": "Rainy season is tough on electronics. Simple steps to keep your phone and laptop safe.",
            "body": (
                "Karachi's monsoon can be hard on phones and laptops.\n\n"
                "Water damage is the most common repair we see during the rainy season, "
                "and it is often avoidable.\n\n"
                "- Use a water-resistant case and a screen protector\n"
                "- Carry electronics in a waterproof bag\n"
                "- Never charge a device that may have got wet\n\n"
                "If your device does get wet, switch it off immediately and bring it in. "
                "Do not try to dry it with a hair dryer — that can push water deeper "
                "inside."
            ),
            "category": "Repair Tips",
            "tags": ["mobiles", "monsoon"],
            "published_at": now - timedelta(days=1),
        },
    ]
    for item in posts:
        db.add(
            BlogPost(
                slug=slugify(item["title"]),
                reading_time=reading_time(item["body"]),
                is_published=True,
                **item,
            )
        )
    db.commit()
    print(f"  + {len(posts)} blog posts")


def _seed_testimonials(db: Session) -> None:
    if db.execute(select(Testimonial).limit(1)).scalars().first() is not None:
        print("  = testimonials already seeded.")
        return
    testimonials: list[dict[str, Any]] = [
        {
            "name": "Ahmed Khan",
            "role": "Student, University of Karachi",
            "message": "I bought my first laptop here and the staff explained everything in simple words. No pressure, just honest advice. Very happy with the price and the free delivery.",
            "message_ur": "میں نے یہاں اپنا پہلا لیپ ٹاپ خریدا اور عملے نے ہر چیز آسان الفاظ میں سمجھائی۔ کوئی دباؤ نہیں، صرف دیانت دار مشورہ۔ قیمت اور مفت ڈیلیوری سے بہت خوش ہوں۔",
            "rating": 5,
            "sort_order": 1,
        },
        {
            "name": "Fatima Siddiqui",
            "role": "Homeowner, Gulshan",
            "message": "Ordered a refrigerator and washing machine. They delivered the same day, set everything up and even explained how to maintain it. Excellent service.",
            "rating": 5,
            "sort_order": 2,
        },
        {
            "name": "Bilal Ahmed",
            "role": "Software Engineer",
            "message": "My laptop screen broke and they replaced it in one day with a genuine part. The three-month warranty on the repair gave me real peace of mind.",
            "rating": 5,
            "sort_order": 3,
        },
        {
            "name": "Ayesha Malik",
            "role": "School Teacher",
            "message": "The installment plan made it possible for me to buy a new phone for my son without any stress. The terms were clear and there were no hidden charges.",
            "message_ur": "اقساط کے منصوبے نے مجھے بغیر کسی پریشانی کے اپنے بیٹے کے لیے نیا فون خریدنے کے قابل بنایا۔ شرائط واضح تھیں اور کوئی چھپا ہوا چارج نہیں تھا۔",
            "rating": 5,
            "sort_order": 4,
        },
        {
            "name": "Usman Tariq",
            "role": "Small Business Owner",
            "message": "They set up CCTV and a POS system for my shop. Professional work, fair pricing, and they answered all my questions patiently. Highly recommended.",
            "rating": 4,
            "sort_order": 5,
        },
    ]
    for item in testimonials:
        db.add(Testimonial(**item))
    db.commit()
    print(f"  + {len(testimonials)} testimonials")


def _seed_settings(db: Session) -> None:
    defaults = {
        "contact_email": settings.mail_owner,
        "contact_phone": "+92 300 0000000",
        "whatsapp_number": "923000000000",
        "address_street": "Shop 12, Electronics Market, Saddar",
        "address_city": "Karachi",
        "google_maps_embed_url": "",
        "google_analytics_id": "",
        "social_facebook": "https://facebook.com/greenvolt",
        "social_instagram": "https://instagram.com/greenvolt",
        "social_tiktok": "https://tiktok.com/@greenvolt",
        "shop_hours": "Mon–Sat 11:00 am–9:00 pm; Sun 2:00 pm–8:00 pm",
    }
    existing = {row.key for row in db.execute(select(SiteSetting)).scalars().all()}
    created = 0
    for key in DEFAULT_SETTING_KEYS:
        if key not in existing:
            db.add(SiteSetting(key=key, value=defaults.get(key, "")))
            created += 1
    db.commit()
    if created:
        print(f"  + {created} site settings")
    else:
        print("  = site settings already seeded.")


def seed() -> None:
    print("Seeding GreenVolt database…")
    SQLModel.metadata.create_all(engine)
    with Session(engine) as db:
        _seed_admin(db)
        _seed_services(db)
        _seed_projects(db)
        _seed_blog(db)
        _seed_testimonials(db)
        _seed_settings(db)
        # Ensure the inquiry table exists even when no sample inquiries are added.
        _ = db.execute(select(ContactMessage).limit(1)).scalars().first()
    print("Done.")


if __name__ == "__main__":
    try:
        seed()
    except Exception as exc:  # pragma: no cover - CLI safety net
        print(f"Seeding failed: {exc}", file=sys.stderr)
        raise
