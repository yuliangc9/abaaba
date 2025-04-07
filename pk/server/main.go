package main

import (
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type PlayerState struct {
	IsGuest bool `json:"isGuest"`
}

type ClickEvent struct {
	Row int `json:"row"`
	Col int `json:"col"`
}

type InitMessage struct {
	Row     int  `json:"row"`
	Col     int  `json:"col"`
	IsGuest bool `json:"isGuest"`
}

type GameRoom struct {
	Players []*websocket.Conn
	mu      sync.Mutex
}

var (
	matchQueue = make(chan *websocket.Conn, 2)
	rooms      = make(map[string]*GameRoom)
)

func main() {
	go matchPlayers()

	r := mux.NewRouter()
	r.HandleFunc("/ws", handleWebSocket)

	log.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}
	log.Printf("客户端连接 [地址=%s]", conn.RemoteAddr())

	// 加入匹配队列
	matchQueue <- conn
}

func matchPlayers() {
	for {
		p1 := <-matchQueue
		p2 := <-matchQueue

		roomID := generateRoomID()
		room := &GameRoom{
			Players: []*websocket.Conn{p1, p2},
		}
		rooms[roomID] = room

		go handleRoom(room)
	}
}

func handleRoom(room *GameRoom) {
	// 初始化玩家状态
	playersState := make(map[*websocket.Conn]*PlayerState)
	for i, p := range room.Players {
		playersState[p] = &PlayerState{
			IsGuest: false,
		}
		if i == 1 {
			playersState[p].IsGuest = true
		}
	}

	// 处理房间消息
	for _, player := range room.Players {
		go func(p *websocket.Conn) {
			defer func() {
				log.Printf("客户端断开 [地址=%s]", p.RemoteAddr())
				p.Close()
			}()
			for {
				var msg map[string]interface{}
				err := p.ReadJSON(&msg)
				if err != nil {
					log.Println("Read error:", err)
					return
				}

				log.Printf("收到消息 [客户端=%s] 类型: %s 内容: %+v", p.RemoteAddr(), msg["type"], msg)
				switch msg["type"].(string) {
				case "init":
					event := msg["data"].(map[string]interface{})
					if playersState[p].IsGuest {
						event["isGuest"] = 1
					}
				}

				// 转发消息给对手
				room.mu.Lock()
				for _, opponent := range room.Players {
					if opponent != p {
						err := opponent.WriteJSON(msg)
						if err != nil {
							log.Println("Write error:", err)
						}
					}
				}
				room.mu.Unlock()
			}
		}(player)
	}
}

func generateRoomID() string {
	return "room" + fmt.Sprintf("%d", time.Now().UnixNano())
}
