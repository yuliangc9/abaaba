#2025.4.5
昨天晚上用html5做了修改，增加PK的机制，两个玩家分别控制一个角色，每个角色都有5个食物容器，并且同样有3个相同食物在容器中消失的逻辑，游戏开始后玩家操作自己的角色去吃地图上的食物，最终比较谁吃得多则谁获胜。
游戏的地图和移动方式重回之前最早的格子风格，角色按照格子移动，食物也按照格子分配。
验证之后感觉可玩性很强，打算开发一个新的游戏分支，专门做PK。
除了基础的PK逻辑之外，后续计划引入的扩展玩法：
1. 地图上引入道具，吃到道具之后触发优势效果，例如加快移动速度，增加一个食物容器
2. 如果角色容器用满，可以观看一个20s的广告，达到删除其中一个食物的目的

值得一提的是，借助目前的AI编程工具，极大提升了独立游戏开发者的效率，我不需要从0开始学习一门语言，就可以在AI的帮助下完成基础游戏框架的搭建，但在面对复杂场景以及一些创新逻辑的开发上，AI显得还是有些力不从心，不能很好理解我的意图，或者进入自己修改的死循环，因此需要我做到更好的任务拆解，协助AI一起完成预期的效果。

PK玩法预计的排期如下：
1. 基础功能逻辑开发，包括服务器逻辑，大概一周时间
2. UI设计和优化，包括动画效果，大概两周时间
3. 完善整体逻辑的补充，大概一周时间
再预留一些其他工作的安排冗余，计划于`2025.5.18`发版提交审核
