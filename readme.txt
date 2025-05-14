php -S localhost:8000 -t public
php -r "echo base64_encode(random_bytes(32));"
APP_KEY=base64:your_generated_key_here
