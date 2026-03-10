import random
import tkinter as tk


class CatchGame:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title("简单小游戏：接金币")
        self.root.resizable(False, False)

        self.width = 480
        self.height = 640
        self.player_size = 60
        self.coin_size = 30

        self.score = 0
        self.time_left = 30
        self.running = False

        self.canvas = tk.Canvas(root, width=self.width, height=self.height, bg="#1b263b", highlightthickness=0)
        self.canvas.pack()

        self.info_text = self.canvas.create_text(
            12,
            12,
            anchor="nw",
            fill="white",
            font=("Arial", 14, "bold"),
            text="分数: 0   剩余时间: 30s",
        )

        self.player_x = (self.width - self.player_size) // 2
        self.player_y = self.height - self.player_size - 18
        self.player = self.canvas.create_rectangle(
            self.player_x,
            self.player_y,
            self.player_x + self.player_size,
            self.player_y + self.player_size,
            fill="#4cc9f0",
            outline="",
        )

        self.coin_x = random.randint(10, self.width - self.coin_size - 10)
        self.coin_y = 60
        self.coin_speed = 6
        self.coin = self.canvas.create_oval(
            self.coin_x,
            self.coin_y,
            self.coin_x + self.coin_size,
            self.coin_y + self.coin_size,
            fill="#ffd60a",
            outline="",
        )

        self.hint = self.canvas.create_text(
            self.width // 2,
            self.height // 2,
            fill="white",
            font=("Arial", 20, "bold"),
            text="按 Enter 开始\n← → 或 A D 移动",
            justify="center",
        )

        self.restart_btn = tk.Button(root, text="鼠标点击重开", command=self.reset_game, font=("Arial", 12, "bold"))
        self.restart_btn.pack(pady=10)

        self.root.bind("<Left>", lambda _: self.move_player(-25))
        self.root.bind("<Right>", lambda _: self.move_player(25))
        self.root.bind("<a>", lambda _: self.move_player(-25))
        self.root.bind("<d>", lambda _: self.move_player(25))
        self.root.bind("<A>", lambda _: self.move_player(-25))
        self.root.bind("<D>", lambda _: self.move_player(25))
        self.root.bind("<Return>", lambda _: self.start_game())
        self.root.bind("<space>", lambda _: self.start_game())

    def start_game(self) -> None:
        if self.running:
            return
        self.running = True
        self.canvas.itemconfig(self.hint, text="")
        self.tick_timer()
        self.animate()

    def reset_game(self) -> None:
        self.score = 0
        self.time_left = 30
        self.running = True

        self.player_x = (self.width - self.player_size) // 2
        self.canvas.coords(
            self.player,
            self.player_x,
            self.player_y,
            self.player_x + self.player_size,
            self.player_y + self.player_size,
        )

        self.reset_coin()
        self.canvas.itemconfig(self.hint, text="")
        self.update_info()
        self.tick_timer()
        self.animate()

    def move_player(self, delta: int) -> None:
        new_x = max(0, min(self.width - self.player_size, self.player_x + delta))
        if new_x == self.player_x:
            return
        self.player_x = new_x
        self.canvas.coords(
            self.player,
            self.player_x,
            self.player_y,
            self.player_x + self.player_size,
            self.player_y + self.player_size,
        )

    def reset_coin(self) -> None:
        self.coin_x = random.randint(10, self.width - self.coin_size - 10)
        self.coin_y = 60
        self.canvas.coords(
            self.coin,
            self.coin_x,
            self.coin_y,
            self.coin_x + self.coin_size,
            self.coin_y + self.coin_size,
        )

    def is_collision(self) -> bool:
        player_left = self.player_x
        player_right = self.player_x + self.player_size
        player_top = self.player_y
        player_bottom = self.player_y + self.player_size

        coin_left = self.coin_x
        coin_right = self.coin_x + self.coin_size
        coin_top = self.coin_y
        coin_bottom = self.coin_y + self.coin_size

        return not (
            coin_right < player_left
            or coin_left > player_right
            or coin_bottom < player_top
            or coin_top > player_bottom
        )

    def update_info(self) -> None:
        self.canvas.itemconfig(self.info_text, text=f"分数: {self.score}   剩余时间: {self.time_left}s")

    def tick_timer(self) -> None:
        if not self.running:
            return
        self.update_info()
        self.time_left -= 1
        if self.time_left < 0:
            self.running = False
            self.canvas.itemconfig(self.hint, text=f"游戏结束！\n最终分数：{self.score}\n按 Enter 或点按钮重开")
            return
        self.root.after(1000, self.tick_timer)

    def animate(self) -> None:
        if not self.running:
            return

        self.coin_y += self.coin_speed
        if self.coin_y > self.height:
            self.reset_coin()

        if self.is_collision():
            self.score += 1
            self.coin_speed = min(14, self.coin_speed + 0.3)
            self.reset_coin()

        self.canvas.coords(
            self.coin,
            self.coin_x,
            self.coin_y,
            self.coin_x + self.coin_size,
            self.coin_y + self.coin_size,
        )
        self.root.after(20, self.animate)


def main() -> None:
    root = tk.Tk()
    CatchGame(root)
    root.mainloop()


if __name__ == "__main__":
    main()
