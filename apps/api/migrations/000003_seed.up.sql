INSERT INTO sites (id, name, slug, description, language)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'My Blog', 'my-blog', 'Stories, ideas and records from a journey.', 'en'),
    ('10000000-0000-0000-0000-000000000002', 'The Chronicles', 'the-chronicles', 'An epic fantasy saga.', 'pt-BR');

INSERT INTO domains (id, site_id, hostname, is_primary)
VALUES
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'localhost', true),
    ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'meublog.com.br', false),
    ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'diario.localhost', true);

INSERT INTO posts (id, site_id, title, slug, content, excerpt, status, published_at)
VALUES
    ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
     'Starting is more important than being perfect',
     'starting-is-more-important-than-being-perfect',
     E'# Starting is more important than being perfect\n\nSometimes we wait for the perfect moment, the perfect motivation, or the perfect plan. But the truth is that the only path forward is to begin with what we have today.\n\n## Why we wait\n\nWe convince ourselves that readiness matters more than action. The blank page stays blank not because we lack talent, but because we lack courage.\n\n> The best time to plant a tree was twenty years ago. The second best time is now.\n\n## A simple beginning\n\nWrite one sentence. Read one page. Take one small step. Progress is built from imperfect beginnings.',
     'Sometimes we wait for the perfect moment, the perfect motivation, or the perfect plan. But the truth is that the only path forward is to begin with what we have today.',
     'PUBLISHED', NOW() - INTERVAL '5 days'),
    ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001',
     'The power of small habits',
     'the-power-of-small-habits',
     E'# The power of small habits\n\nGreat outcomes are rarely the product of grand gestures. They are the accumulation of small, repeated acts performed when no one is watching.\n\n## Compounding\n\nA 1% improvement every day compounds into extraordinary change over time.\n\n- Read for ten minutes daily\n- Write a single paragraph\n- Walk a little further\n\nEach small habit is a vote for the person you want to become.',
     'Great outcomes are rarely the product of grand gestures. They are the accumulation of small, repeated acts performed when no one is watching.',
     'PUBLISHED', NOW() - INTERVAL '2 days'),
    ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001',
     'Lessons I learned from reading more',
     'lessons-i-learned-from-reading-more',
     E'# Lessons I learned from reading more\n\nReading widely sharpens the mind and softens the heart.\n\n## Patience\n\nA good book teaches patience. You cannot skim your way to depth.\n\n## Curiosity\n\nEvery finished page begets a new question, and every question is an invitation to keep going.',
     'Reading widely sharpens the mind and softens the heart.',
     'PUBLISHED', NOW() - INTERVAL '12 days');

INSERT INTO pages (id, site_id, title, slug, content, status)
VALUES
    ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
     'About', 'about',
     E'# About\n\nThis is a personal publication. A place for stories, ideas, and records from a journey. Thank you for reading.',
     'PUBLISHED');

INSERT INTO stories (id, site_id, title, slug, description)
VALUES
    ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002',
     'The Chronicles of the Lost Realm', 'chronicles-of-the-lost-realm',
     'The main saga of a kingdom on the edge of memory.');

INSERT INTO story_groups (id, story_id, title, slug, position)
VALUES
    ('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Book 1', 'book-1', 1),
    ('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 'Book 2', 'book-2', 2);

INSERT INTO chapters (id, story_id, group_id, title, slug, content, position, status, published_at)
VALUES
    ('70000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001',
     'The Beginning of the Journey', 'the-beginning-of-the-journey',
     E'# Chapter One\n\nThe road began at dawn, thin and grey against a misty horizon. A young wanderer, tired of maps that led nowhere, decided to follow the land itself.\n\n## A small choice\n\nEvery great journey begins with a choice that seems small at the time.',
     1, 'PUBLISHED', NOW() - INTERVAL '10 days'),
    ('70000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001',
     'The Whispering Forest', 'the-whispering-forest',
     E'# Chapter Two\n\nThe forest breathed. Every leaf seemed to hold a secret, and the wind carried voices that were almost words.\n\n> Listen with your feet, the old woman said. The ground remembers everything.',
     2, 'PUBLISHED', NOW() - INTERVAL '8 days'),
    ('70000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000002',
     'The City of Shells', 'the-city-of-shells',
     E'# Chapter Three\n\nBeyond the forest stood a city built from the bones of old songs. Its towers were carved from the shells of great sea creatures.\n\n## Arrival\n\nEvery arrival is also a leaving behind. The city hummed with the weight of what had been abandoned.',
     3, 'PUBLISHED', NOW() - INTERVAL '5 days');

INSERT INTO navigation_items (id, site_id, label, type, destination, position, is_visible)
VALUES
    ('80000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Home', 'home', '/', 1, true),
    ('80000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Blog', 'posts', '/posts', 2, true),
    ('80000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Stories', 'stories', '/stories', 3, true),
    ('80000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'About', 'page', '/pages/about', 4, true);
