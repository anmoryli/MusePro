// src/main/java/com/anmory/musepro/mapper/SongsMapper.java
package com.anmory.musepro.mapper;

import com.anmory.musepro.model.Songs;
import org.apache.ibatis.annotations.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Mapper
public interface SongsMapper {

    // 1. 提交生成任务时插入一条“任务记录”（clip_id 为 NULL）
    @Insert("INSERT INTO songs " +
            "(user_id, task_id, title, gpt_description_prompt, custom_prompt, tags, " +
            "mv_version, make_instrumental, continue_clip_id, continue_at, status) " +
            "VALUES " +
            "(#{userId}, #{taskId}, #{title}, #{gptDescriptionPrompt}, #{customPrompt}, #{tags}, " +
            "#{mvVersion}, #{makeInstrumental}, #{continueClipId}, #{continueAt}, 'generating')")
    void insertTask(
            @Param("userId") Integer userId,
            @Param("taskId") String taskId,
            @Param("title") String title,
            @Param("gptDescriptionPrompt") String gptDescriptionPrompt,
            @Param("customPrompt") String customPrompt,
            @Param("tags") String tags,
            @Param("mvVersion") String mvVersion,
            @Param("makeInstrumental") Boolean makeInstrumental,
            @Param("continueClipId") String continueClipId,
            @Param("continueAt") BigDecimal continueAt
    );

    // 2. 生成完成后，每首歌单独插入一条完整记录
    @Insert("INSERT INTO songs " +
            "(user_id, task_id, clip_id, title, custom_prompt, tags, mv_version, make_instrumental, " +
            "status, audio_url, video_url, duration, lyrics, cover_image, finished_at) " +
            "VALUES " +
            "(#{userId}, #{taskId}, #{clipId}, #{title}, #{customPrompt}, #{tags}, #{mvVersion}, #{makeInstrumental}, " +
            "'completed', #{audioUrl}, #{videoUrl}, #{duration}, #{lyrics}, #{coverImage}, NOW())")
    void insertCompletedSong(
            @Param("userId") Integer userId,
            @Param("taskId") String taskId,
            @Param("clipId") String clipId,
            @Param("title") String title,
            @Param("customPrompt") String customPrompt,
            @Param("tags") String tags,
            @Param("mvVersion") String mvVersion,
            @Param("makeInstrumental") Boolean makeInstrumental,
            @Param("audioUrl") String audioUrl,
            @Param("videoUrl") String videoUrl,
            @Param("duration") Integer duration,
            @Param("lyrics") String lyrics,
            @Param("coverImage") String coverImage
    );

    // 3. 标记整个任务已完成（可选）
    @Update("UPDATE songs SET status = 'completed', finished_at = NOW() WHERE task_id = #{taskId}")
    void markTaskCompleted(@Param("taskId") String taskId);

    // 4. 查询所有正在生成的任务（clip_id 为 NULL 且 status = generating）
    @Select("SELECT * FROM songs WHERE status = 'generating' AND clip_id IS NULL")
    List<Songs> getGeneratingTasks();

    // 5. 根据 task_id 查询该任务下所有已完成的歌曲（用于前端展示）
    @Select("SELECT * FROM songs WHERE task_id = #{taskId} AND clip_id IS NOT NULL ORDER BY song_id")
    List<Songs> getSongsByTaskId(String taskId);

    // 6. 查询我的所有歌曲列表
    @Select("SELECT * FROM songs WHERE user_id = #{userId} AND clip_id IS NOT NULL ORDER BY finished_at DESC")
    List<Songs> getMySongs(Integer userId);

    // 在 SongsMapper.java 里追加这些方法
    @Select("SELECT * FROM songs WHERE clip_id = #{clipId}")
    Songs getByClipId(@Param("clipId") String clipId);

    @Delete("DELETE FROM songs WHERE clip_id = #{clipId}")
    void deleteByClipId(@Param("clipId") String clipId);

    @Update("UPDATE songs SET is_public = #{status} WHERE clip_id = #{clipId}")
    void updatePublicStatus(@Param("clipId") String clipId, @Param("status") int status);

    @Update("UPDATE songs SET play_count = play_count + 1 WHERE clip_id = #{clipId}")
    void incrementPlayCount(@Param("clipId") String clipId);

    @Update("UPDATE songs SET like_count = like_count + 1 WHERE clip_id = #{clipId}")
    void incrementLikeCount(@Param("clipId") String clipId);

    @Update("UPDATE songs SET midi_url = #{midiUrl} WHERE clip_id = #{clipId}")
    void updateMidiUrl(@Param("clipId") String clipId, @Param("midiUrl") String midiUrl);

    @Select("SELECT * FROM songs where clip_id IS NOT NULL and is_public = true")
    List<Songs> getAllPublicSongs();

    @Select("SELECT COUNT(*) FROM songs WHERE clip_id IS NOT NULL AND DATE(finished_at) = CURDATE()")
    int countTodaySongs();

    @Select("SELECT COALESCE(SUM(play_count), 0) FROM songs WHERE clip_id IS NOT NULL")
    int sumAllPlayCount();

    @Select("SELECT COALESCE(SUM(like_count), 0) FROM songs WHERE clip_id IS NOT NULL")
    int sumAllLikeCount();

    @Select("SELECT COUNT(DISTINCT user_id) FROM songs WHERE clip_id IS NOT NULL")
    int countUsersWhoGenerated();

    @Select("SELECT COUNT(*) FROM songs WHERE clip_id IS NOT NULL AND DATE(finished_at) = #{date}")
    int countSongsByDate(String date);

    @Select("SELECT s.*, u.nickname FROM songs s LEFT JOIN users u ON s.user_id = u.user_id WHERE s.clip_id IS NOT NULL ORDER BY s.play_count DESC, s.like_count DESC LIMIT #{limit}")
    List<Map<String, Object>> getTopSongs(@Param("limit") int limit);

    @Select("SELECT s.user_id, u.nickname, u.email, COUNT(*) as song_count, SUM(s.play_count) as total_play " +
            "FROM songs s LEFT JOIN users u ON s.user_id = u.user_id " +
            "WHERE s.clip_id IS NOT NULL GROUP BY s.user_id ORDER BY song_count DESC")
    List<Map<String, Object>> countSongsGroupByUser();

    @Select("SELECT COUNT(*) FROM songs WHERE clip_id IS NOT NULL")
    int countAllSongs();

    @Select("SELECT * FROM songs WHERE task_id = #{taskId}")
    Songs getTaskById(String taskId);

    @Select("SELECT * FROM songs ORDER BY song_id DESC LIMIT 1")
    Songs getLastSong();

    @Select("SELECT * FROM songs WHERE status = 'generating' ORDER BY created_at ASC LIMIT 20 FOR UPDATE SKIP LOCKED")
    List<Songs> getGeneratingTasksWithLimit();

    @Select("""
        SELECT *
        FROM songs
        WHERE status = 'generating'
        AND clip_id IS NULL
        ORDER BY created_at ASC
        LIMIT 20
        """)
    List<Songs> listPendingTasks();

}