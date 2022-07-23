# Thông tin dự án:
Backlog Clone
## Yêu cầu:
1. PHP 7.4^
2. Mysql (Or MariaDB)
3. node 16.0^
4. yarn
## Setup
1. copy .env.example => .env
2. Thay đổi thông tin Database, Nếu dùng DB local thì không cần thay đổi
3. Tạo DB `backlog`
4. Chạy lệnh:
```
composer install
yarn install
php artisan migrate
php artisan db:seed
```
## Chạy project
bật 2 cửa sổ command line, chạy 2 server:
```
php artisan serve
yarn dev
```

## Production:
1. Đổi APP_ENV trong .env thành Production
2. Build frontend:
```
yarn build
```
3. chạy php server:
```
php artisan serve
```