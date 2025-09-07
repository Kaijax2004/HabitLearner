# HabitLearner 404错误修复指南

## 🚨 问题诊断

您遇到的404错误是典型的SPA（单页应用）部署问题。当用户直接访问 `/auth` 路由时，Nginx找不到对应的文件，因为Vue Router使用客户端路由。

## 🔧 解决方案

### 方案1：修复Nginx配置（必须）

在您的服务器上创建或修改Nginx配置文件：

#### 1. 创建配置文件
```bash
sudo nano /etc/nginx/sites-available/habitlearner.cn
```

#### 2. 添加以下配置
```nginx
server {
    listen 80;
    server_name habitlearner.cn www.habitlearner.cn;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name habitlearner.cn www.habitlearner.cn;
    
    # SSL证书配置
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # 网站根目录
    root /var/www/habitlearner.cn;
    index index.html;
    
    # 关键配置：支持SPA路由
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 网站图标和静态文件
    location ~* \.(ico|png|svg|jpg|jpeg|gif|webp)$ {
        expires 1y;
        add_header Cache-Control "public";
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

#### 3. 启用站点
```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/habitlearner.cn /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

### 方案2：检查文件部署

#### 1. 确认文件结构
```bash
# 检查网站根目录
ls -la /var/www/habitlearner.cn/
```

应该看到：
```
-rw-r--r-- 1 www-data www-data   975 index.html
-rw-r--r-- 1 www-data www-data  1234 favicon.ico
-rw-r--r-- 1 www-data www-data  5678 favicon.svg
-rw-r--r-- 1 www-data www-data  9012 favicon.png
drwxr-xr-x 2 www-data www-data  4096 assets/
```

#### 2. 设置正确权限
```bash
# 设置文件权限
sudo chown -R www-data:www-data /var/www/habitlearner.cn/
sudo chmod -R 755 /var/www/habitlearner.cn/
```

### 方案3：重新部署文件

#### 1. 上传最新构建文件
```bash
# 使用scp上传
scp -r dist/* user@your-server:/var/www/habitlearner.cn/

# 或使用rsync
rsync -avz --delete dist/ user@your-server:/var/www/habitlearner.cn/
```

#### 2. 验证部署
```bash
# 检查index.html内容
cat /var/www/habitlearner.cn/index.html
```

应该看到正确的资源路径：
```html
<script type="module" crossorigin src="https://habitlearner.cn/assets/index-CY8fxbbT.js"></script>
```

## 🧪 测试步骤

### 1. 测试基本访问
```bash
# 测试根路径
curl -I https://habitlearner.cn/

# 应该返回200状态码
```

### 2. 测试SPA路由
```bash
# 测试直接访问路由
curl -I https://habitlearner.cn/auth

# 应该返回200状态码，而不是404
```

### 3. 测试静态资源
```bash
# 测试CSS文件
curl -I https://habitlearner.cn/assets/index-DVq3sa0p.css

# 测试JS文件
curl -I https://habitlearner.cn/assets/index-CY8fxbbT.js
```

## 🔍 故障排除

### 常见问题

#### 1. 仍然404错误
- 检查Nginx配置是否正确加载
- 确认 `try_files $uri $uri/ /index.html;` 配置存在
- 重启Nginx服务

#### 2. 静态资源404
- 检查assets文件夹是否存在
- 确认文件权限正确
- 验证文件路径

#### 3. SSL证书问题
- 确认SSL证书路径正确
- 检查证书是否过期
- 验证域名匹配

### 调试命令
```bash
# 查看Nginx错误日志
sudo tail -f /var/log/nginx/error.log

# 查看访问日志
sudo tail -f /var/log/nginx/access.log

# 测试Nginx配置
sudo nginx -t

# 重新加载Nginx配置
sudo nginx -s reload
```

## 📋 部署检查清单

- [ ] Nginx配置包含 `try_files $uri $uri/ /index.html;`
- [ ] 网站根目录指向正确路径
- [ ] 所有dist文件已上传
- [ ] 文件权限设置正确
- [ ] SSL证书配置正确
- [ ] Nginx服务重启
- [ ] 测试根路径访问
- [ ] 测试SPA路由访问
- [ ] 测试静态资源访问

## 🚀 快速修复命令

如果您有服务器访问权限，可以运行以下命令快速修复：

```bash
# 1. 备份当前配置
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# 2. 创建新配置
sudo tee /etc/nginx/sites-available/habitlearner.cn > /dev/null <<EOF
server {
    listen 80;
    server_name habitlearner.cn www.habitlearner.cn;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name habitlearner.cn www.habitlearner.cn;
    
    root /var/www/habitlearner.cn;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 3. 启用站点
sudo ln -sf /etc/nginx/sites-available/habitlearner.cn /etc/nginx/sites-enabled/

# 4. 测试并重启
sudo nginx -t && sudo systemctl restart nginx
```

完成这些步骤后，您的网站应该可以正常访问所有路由了！
