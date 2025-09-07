# HabitLearner 手动部署指南

## 🎯 问题分析

您之前遇到的404错误很可能是因为缺少了关键的配置文件。现在我们已经创建了所有必要的配置文件。

## 📁 需要上传的文件

### 1. 构建文件（dist文件夹内容）
```
dist/
├── index.html
├── favicon.ico
├── favicon.svg
├── favicon.png
└── assets/
    ├── *.css
    ├── *.js
    └── *.svg
```

### 2. 配置文件（新增）
```
.htaccess-nginx-fix          # Apache配置（如果使用Apache）
nginx-spa-config.conf        # Nginx配置（如果使用Nginx）
deploy-to-server.sh          # 自动部署脚本
```

## 🚀 部署步骤

### 方法1：使用自动部署脚本

1. **修改配置**：
   ```bash
   # 编辑 deploy-to-server.sh
   nano deploy-to-server.sh
   
   # 修改以下变量：
   SERVER_USER="your-username"      # 您的服务器用户名
   SERVER_HOST="your-server-ip"     # 您的服务器IP
   ```

2. **运行部署脚本**：
   ```bash
   chmod +x deploy-to-server.sh
   ./deploy-to-server.sh
   ```

### 方法2：手动部署

#### 步骤1：上传网站文件
```bash
# 上传dist文件夹内容
scp -r dist/* user@your-server:/var/www/habitlearner.cn/

# 或者使用rsync
rsync -avz --delete dist/ user@your-server:/var/www/habitlearner.cn/
```

#### 步骤2：配置Nginx
```bash
# 上传Nginx配置
scp nginx-spa-config.conf user@your-server:/tmp/

# 在服务器上执行
ssh user@your-server
sudo cp /tmp/nginx-spa-config.conf /etc/nginx/sites-available/habitlearner.cn
sudo ln -sf /etc/nginx/sites-available/habitlearner.cn /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 步骤3：设置权限
```bash
# 在服务器上执行
sudo chown -R www-data:www-data /var/www/habitlearner.cn/
sudo chmod -R 755 /var/www/habitlearner.cn/
```

## 🔧 关键配置文件说明

### nginx-spa-config.conf
这是解决404错误的核心配置文件，包含：

1. **SPA路由支持**：
   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```

2. **静态资源缓存**：
   ```nginx
   location /assets/ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

3. **安全配置**：
   - SSL配置
   - 安全头设置
   - Gzip压缩

### .htaccess-nginx-fix
如果您的服务器使用Apache而不是Nginx，这个文件包含：

1. **URL重写规则**：
   ```apache
   RewriteRule . /index.html [L]
   ```

2. **缓存配置**：
   ```apache
   ExpiresByType text/css "access plus 1 year"
   ```

## 🧪 测试部署

部署完成后，测试以下URL：

1. **根路径**：`https://habitlearner.cn/`
   - 应该显示登录页面

2. **直接访问路由**：`https://habitlearner.cn/auth`
   - 应该显示登录页面，而不是404

3. **其他路由**：`https://habitlearner.cn/dashboard`
   - 应该正常显示（需要先登录）

4. **静态资源**：`https://habitlearner.cn/assets/index-DVq3sa0p.css`
   - 应该正常加载CSS文件

## 🔍 故障排除

### 如果仍然404错误

1. **检查Nginx配置**：
   ```bash
   sudo nginx -t
   ```

2. **查看错误日志**：
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. **确认文件存在**：
   ```bash
   ls -la /var/www/habitlearner.cn/
   ```

4. **检查权限**：
   ```bash
   ls -la /var/www/habitlearner.cn/index.html
   ```

### 如果静态资源404

1. **检查assets文件夹**：
   ```bash
   ls -la /var/www/habitlearner.cn/assets/
   ```

2. **检查文件权限**：
   ```bash
   sudo chmod -R 755 /var/www/habitlearner.cn/assets/
   ```

## 📋 部署检查清单

- [ ] dist文件夹内容已上传
- [ ] nginx-spa-config.conf已配置
- [ ] Nginx配置包含 `try_files $uri $uri/ /index.html;`
- [ ] 文件权限设置正确 (755)
- [ ] Nginx服务已重启
- [ ] SSL证书配置正确
- [ ] 测试根路径访问正常
- [ ] 测试SPA路由访问正常
- [ ] 测试静态资源访问正常

## 🎉 部署完成

完成所有步骤后，您的HabitLearner网站应该可以正常访问所有路由了！

如果还有问题，请检查：
1. 服务器错误日志
2. 浏览器开发者工具的控制台
3. 网络请求状态
