package seed
import(
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"gorm.io/gorm"
	"time"
    "log"
)
func Seedchat(db *gorm.DB){
	var count int64
	db.Model(&entity.ChatRoom{}).Count(&count)
	if count > 0 {
		log.Println("Seed skipped: data already exists")
	} else {
		// สร้างห้องแชทระหว่าง student กับ employer
		room := entity.ChatRoom{
			Model:      gorm.Model{ID: 1},
			StudentID:  2,
			EmployerID: 1,
			Lastmessage: "ได้เลยครับ ขอบคุณครับ",
			LastMessageAt: time.Now().Add(-1 * time.Minute),
		}
		db.FirstOrCreate(&room, room.ID)

		// เพิ่มข้อความตัวอย่าง
		msgs := []entity.ChatHistory{
			{
				Model:         gorm.Model{ID: 1},
				ChatRoomID:    room.ID,
				UserSenderID:  6,
				Message:       "สวัสดีครับ ผมสนใจงานนักพัฒนา Server ครับ",
				TimeStampSend: time.Now().Add(-5 * time.Minute),
			},
			{
				Model:         gorm.Model{ID: 2},
				ChatRoomID:    room.ID,
				UserSenderID:  1,
				Message:       "ยินดีครับ ส่งเรซูเม่มาได้เลย",
				TimeStampSend: time.Now().Add(-3 * time.Minute),
			},
			{
				Model:         gorm.Model{ID: 3},
				ChatRoomID:    room.ID,
				UserSenderID:  6,
				Message:       "ได้เลยครับ ขอบคุณครับ",
				TimeStampSend: time.Now().Add(-1 * time.Minute),
			},
		}
		for _, mess := range msgs {
			db.FirstOrCreate(&mess, mess.ID)
		}
	}
}