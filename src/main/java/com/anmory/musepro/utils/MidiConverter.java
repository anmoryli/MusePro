// src/main/java/com/anmory/musepro/utils/MidiConverter.java
package com.anmory.musepro.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.net.ssl.*;
import java.io.*;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.util.UUID;

@Component
public class MidiConverter {

    private static final Logger log = LoggerFactory.getLogger(MidiConverter.class);

    // 用 conda 环境里的 basic-pitch 命令（最稳！）
    private static final String BASIC_PITCH_CMD = "/root/anaconda3/envs/midi/bin/basic-pitch";

    // 你的文件目录
    private static final String LOCAL_DIR = "/usr/local/nginx/files/mo-face-swap";

    // 静态块：只对你的 IP 放行 SSL 校验（完美解决 IP 访问证书问题）
    static {
        trustSelfSignedForIP("175.24.205.213");
    }

    private static void trustSelfSignedForIP(String ip) {
        try {
            TrustManager[] trustAll = new TrustManager[]{
                    new X509TrustManager() {
                        public X509Certificate[] getAcceptedIssuers() { return null; }
                        public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                        public void checkServerTrusted(X509Certificate[] certs, String authType) {}
                    }
            };

            SSLContext sc = SSLContext.getInstance("SSL");
            sc.init(null, trustAll, new SecureRandom());
            HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
            HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) ->
                    "175.24.205.213".equals(hostname) || hostname.endsWith("anmory.com")
            );
        } catch (Exception e) {
            log.error("SSL 绕过配置失败", e);
        }
    }

    public String convertToMidi(String audioUrl) {
        String fileName = UUID.randomUUID().toString();
        File inputFile = new File(LOCAL_DIR, fileName + ".mp3");
        File outputDir = new File(LOCAL_DIR, "midi_temp_" + fileName);

        try {
            // 1. 下载音频（SSL 已经绕过）
            log.info("开始下载音频: {}", audioUrl);
            downloadFile(audioUrl, inputFile.getAbsolutePath());

            // 2. 创建输出目录
            if (!outputDir.mkdir()) {
                throw new RuntimeException("创建临时目录失败: " + outputDir);
            }

            // 3. 执行 basic-pitch 转换（最稳方式！）
            log.info("开始 MIDI 转换: {} -> {}", inputFile, outputDir);
            ProcessBuilder pb = new ProcessBuilder(
                    BASIC_PITCH_CMD,
                    outputDir.getAbsolutePath(),
                    inputFile.getAbsolutePath(),
                    "--save-midi"
            );
            pb.redirectErrorStream(true);
            Process process = pb.start();

            // 实时打印日志
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                reader.lines().forEach(line -> log.info("basic-pitch: {}", line));
            }

            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new RuntimeException("MIDI 转换失败，exit code: " + exitCode);
            }

            // 4. 找到生成的 MIDI 文件
            File[] midiFiles = outputDir.listFiles((dir, name) ->
                    name.endsWith(".mid") || name.endsWith(".midi"));
            if (midiFiles == null || midiFiles.length == 0) {
                throw new RuntimeException("未生成 MIDI 文件");
            }

            // 5. 移动到最终位置
            String finalName = fileName + ".mid";
            File finalFile = new File(LOCAL_DIR, finalName);
            Files.move(midiFiles[0].toPath(), finalFile.toPath(), StandardCopyOption.REPLACE_EXISTING);

            // 6. 清理临时文件
            inputFile.delete();
            deleteDirectory(outputDir);

            String midiUrl = "https://175.24.205.213:100/mo-face-swap/" + finalName;
            log.info("MIDI 转换成功: {}", midiUrl);
            return midiUrl;

        } catch (Exception e) {
            log.error("MIDI 转换失败 clip_id 未知", e);
            // 清理残留文件
            if (inputFile.exists()) inputFile.delete();
            if (outputDir.exists()) deleteDirectory(outputDir);
            return null;
        }
    }

    private void downloadFile(String urlStr, String savePath) throws IOException {
        try (InputStream in = new URL(urlStr).openStream();
             FileOutputStream out = new FileOutputStream(savePath)) {
            byte[] buffer = new byte[8192];
            int len;
            while ((len = in.read(buffer)) != -1) {
                out.write(buffer, 0, len);
            }
        }
    }

    private void deleteDirectory(File dir) {
        if (!dir.exists()) return;
        File[] files = dir.listFiles();
        if (files != null) {
            for (File f : files) {
                if (f.isDirectory()) deleteDirectory(f);
                else f.delete();
            }
        }
        dir.delete();
    }
}