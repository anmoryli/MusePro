-- ==============================
-- MuseFlow AI 音乐平台 MySQL 专用版
-- 直接复制全部执行即可
-- ==============================
drop table if exists orders;
drop table if exists safe_singer_prompts;
drop table if exists songs;
drop table if exists users;

-- 1. 用户表
CREATE TABLE users (
                       user_id int PRIMARY KEY AUTO_INCREMENT COMMENT 'UUID',
                       email VARCHAR(255) UNIQUE NOT NULL,
                       password_hash VARCHAR(255) NOT NULL,
                       nickname VARCHAR(50) DEFAULT '音乐人',
                       avatar VARCHAR(500) DEFAULT 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
                       credits INT DEFAULT 30 COMMENT '免费额度（首）',
                       is_vip TINYINT(1) DEFAULT 0,
                       vip_expires_at DATETIME NULL,
                       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                       updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                       INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 歌曲作品表（核心表，对应云雾 task_id）
CREATE TABLE songs (
                       song_id int PRIMARY KEY AUTO_INCREMENT COMMENT 'UUID',
                       user_id int NOT NULL,

    -- 云雾任务字段
                       task_id VARCHAR(64) UNIQUE NOT NULL COMMENT '云雾返回的任务ID',
                       clip_id VARCHAR(64) NULL COMMENT '最终生成的歌曲clip_id',

    -- 用户输入参数
                       title VARCHAR(255) NOT NULL,
                       custom_prompt LONGTEXT NULL COMMENT '自定义歌词（完整带[Verse]标签）',
                       tags VARCHAR(500) NULL COMMENT '风格标签，逗号分隔',
                       mv_version VARCHAR(20) DEFAULT 'chirp-v4' COMMENT '模型版本',
                       make_instrumental TINYINT(1) DEFAULT 0,
                       continue_clip_id VARCHAR(64) NULL,
                       continue_at DECIMAL(6,3) NULL COMMENT '续写起始秒数',
                       gpt_description_prompt TEXT NULL COMMENT '创作描述提示词，仅用于灵感模式',
                       notify_hook VARCHAR(500) NULL COMMENT '通知回调地址，用于生成成功后通知',

    -- 生成结果
                       status ENUM('pending','generating','completed','failed') DEFAULT 'pending',
                       audio_url VARCHAR(1000) NULL,
                       video_url VARCHAR(1000) NULL,
                       duration INT NULL COMMENT '秒',
                       lyrics LONGTEXT NULL,
                       cover_image VARCHAR(1000) NULL,

    -- 增强功能字段（你独有）
                       midi_url VARCHAR(1000) NULL COMMENT '音频转MIDI结果',
                       stems JSON NULL COMMENT '{"vocal":"url","drum":"url","bass":"url","other":"url"}',
                       safe_prompt TEXT NULL COMMENT '防封歌手风格提示词',
                       merged_audio_url VARCHAR(1000) NULL COMMENT '拼接后的完整版',

    -- 统计 & 权限
                       is_public TINYINT(1) DEFAULT 0,
                       play_count INT DEFAULT 0,
                       like_count INT DEFAULT 0,

                       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                       finished_at DATETIME NULL,

                       INDEX idx_user (user_id),
                       INDEX idx_task (task_id),
                       INDEX idx_clip (clip_id),
                       INDEX idx_public (is_public, created_at DESC),
                       INDEX idx_status (status),
                       FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. 会员订单表（支持退款）
CREATE TABLE orders (
                        order_id int PRIMARY KEY,
                        user_id int NOT NULL,
                        amount_yuan INT NOT NULL COMMENT '单位：元',
                        type ENUM('vip_month','vip_year','lifetime','credits_pack') NOT NULL,
                        status ENUM('paid','refunded','pending','cancelled') DEFAULT 'pending',
                        out_trade_no VARCHAR(64) UNIQUE NOT NULL COMMENT '你的商户订单号',
                        transaction_id VARCHAR(128) NULL COMMENT '微信/支付宝订单号',
                        refund_reason VARCHAR(500) NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

                        INDEX idx_user (user_id),
                        INDEX idx_out_trade (out_trade_no),
                        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. 防封歌手提示词库
CREATE TABLE safe_singer_prompts (
                                     safe_id INT AUTO_INCREMENT PRIMARY KEY,
                                     singer_name VARCHAR(100) NOT NULL COMMENT '真实歌手名，如 周杰伦',
                                     safe_description TEXT NOT NULL COMMENT '防封描述，如 华语男歌手，咬字清晰，旋律抓耳，R&B+流行',
                                     style_tags VARCHAR(500) DEFAULT 'chinese pop, mandopop, emotional',
                                     usage_count INT DEFAULT 0,
                                     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                     UNIQUE KEY uniq_singer (singer_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;