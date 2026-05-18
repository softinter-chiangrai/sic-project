/*
 * @Author: MitsuhaYuki
 * @Date: 2024-01-26 13:27:21
 * @LastEditTime: 2024-01-26 16:03:47
 * @LastEditors: MitsuhaYuki
 * @Description: Technical Reference: https://github.com/chokcoco/iCSS/issues/220
 */
registerPaint(
  "waveDraw",
  class {
    static get inputProperties () {
      return [
        "--animation-tick",
        "--height",
        "--gap",
        "--amplitude",
        "--layer1color", // bottom layer
        "--layer2color", // middle layer
        "--layer3color"  // top layer
      ]
    }

    paint (ctx, size, properties) {
      let tick = Number(properties.get("--animation-tick"))
      let initHeight = Number(properties.get("--height"))
      let gap = Number(properties.get("--gap"))
      let amplitude = Number(properties.get("--amplitude"))
      let color1 = properties.get("--layer1color")
      let color2 = properties.get("--layer2color")
      let color3 = properties.get("--layer3color")

      this.draw(ctx, size, tick, amplitude, gap, initHeight, color1)
      this.draw(ctx, size, tick * 1.21, amplitude / 0.82, gap + 2, initHeight + 0.02, color2)
      this.draw(ctx, size, tick * 0.79, amplitude / 1.19, gap - 2, initHeight - 0.02, color3)
    }

    /**
     *
     * @param {*} ctx PaintWorklet API inherited
     * @param {*} size PaintWorklet API inherited
     * @param {number} tick Animation tick
     * @param {number} amplitude Describe the distance between the highest and lowest points of a wave
     * @param {number} gap Describe the distance between two wave crests
     * @param {number} initHeight The animation occupies the height ratio of the animation container element (0~1)
     * @param {*} color The color value of this layer animation
     */
    draw (ctx, size, tick, amplitude, gap, initHeight, color) {
      const { width, height } = size
      const initY = height * initHeight
      tick = tick * 2

      ctx.beginPath()
      for (let i = 0; i <= width; i++) {
        ctx.lineTo(i, initY + Math.sin((i + tick) / gap) * amplitude)
      }
      ctx.lineTo(width, height)
      ctx.lineTo(0, height)
      ctx.lineTo(0, initY)
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()
    }
  }
)
