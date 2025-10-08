Hey again! I refreshed my memory and I’m back. I’ll try to explain everything here as clearly as I can, and if I can find the time later, I’ll record a video to demonstrate it. Hopefully that will help.

From what I understand, combining Gerstner waves properly really comes down to two key points. The first is solving the wave crest softening issue that appears as the number of waves increases. The second is ensuring that the waves combine in a way that creates visually pleasing and natural-looking patterns, which mostly depends on how we distribute the wave directions. Everything else seems to be about balancing all parameters so that they work harmoniously together.

So let’s start with wave combination. The best reference I’ve found so far is this GDC talk:
https://www.youtube.com/watch?v=MdC7L1OloKE&t=1613s

In that technique, waves are divided into bands, each containing an odd number of waves, and they are evenly distributed around 360 degrees. This setup creates overlapping waves that result in the desirable oscillating motion where waves rise sharply to a peak and then spread out again, repeating this pattern naturally across the surface.

For example, if we have a total of 7 or 16 waves, the grouping might look like this:
10 = 1 + 3 + 5 + 1
15 = 1 + 3 + 5 + 6
This shows that while we usually prefer odd-numbered bands, even-numbered ones can appear when no other waves remain.

Because of this system, I don’t manually define the direction for every wave. I only control the first wave, which, since it has the largest wavelength and amplitude, essentially defines the overall flow direction of the water. The wavelength and amplitude values for the rest of the waves are automatically reduced using another exposed parameter.

I haven’t implemented a threshold to discard extremely small waves yet. Those waves don’t contribute much visually and often glide over the surface in an unnatural way, so for now I manually tune the parameters until the result looks right. Given this setup, I think the main controllable direction parameter can effectively represent rivers or flow direction in the shader.

Regarding the scaling down of wave parameters, I borrowed the concept from the GPU Gems article, though I simplified it. In that article, they take the middle value as the base and adjust other values to be half or double that base. The downside is that you can’t easily predict the outcome unless you experiment a lot. By dividing progressively down to a minimum, I can directly specify the values in engine units, which makes it much easier to work with and achieve precise results.

Now, about softening and sharpening the wave crests, two methods seem to work.

Allowing the steepness value to go above 1.0

Multiplying the world-space vertex positions by a scalar

When using the first method (steepness above 1), as the steepness increases, the speed of the waves also increases, which can break the natural, heavy motion of the water. The second method, multiplying vertex positions, provides a sharper shape that’s independent of speed.

However, one thing to keep in mind with this method is that it can tile the waves. For instance, if your maximum wavelength is 120 and you’re using a world-space multiplier of 6, then your effective wavelength becomes 20 in the scene. This means the waves will repeat every 20 engine units instead of every 120. To fix that, you can multiply the wavelength parameter by the world-space multiplier before feeding it into the Gerstner calculations.

The way I tune parameters usually depends on the situation, but I think it can be methodized to some degree. Here’s roughly how it works:

Wave Direction:
I only control the first wave, the one with the highest amplitude and wavelength. The rest are distributed automatically using the method mentioned earlier. So this is probably the parameter I tweak the least, unless I need an artistic variation or have to define a specific flow direction such as for rivers or flow maps.

Wave Length:
This was the first parameter I experimented with since it defines the overall scale of the water surface and its profile. If wavelength and amplitude are both high, the waves become large and powerful, good for deep sea or stormy water. For calm coastal waters, I usually keep it between 6 and 60 meters. If the result looks too calm or pool-like, I slightly increase the value to introduce more visible oscillations.

Wave Amplitude:
I adjust it until the waves look good. For small coastal waves, it’s usually around 0.1 to 0.2 meters, and for deep ocean or storm conditions it can go above 1.0.

Wave Speed:
I rarely touch it, though it can be used for stylized or cinematic effects.

World Space Multiplier:
When many waves are combined, crests often get too soft. In that case, I keep steepness around 0.5 to 0.7 and increase this multiplier, usually between 4 and 8, to sharpen the waves. If waves lose fluidity and crests stop flipping over, I increase steepness. If motion looks good but crests start flipping unnaturally, I slightly lower steepness to fine-tune it.

Wave Steepness:
Usually sits around 0.5 to 0.7. If the wave count is high, steepness becomes less noticeable, so I use the WS multiplier to bring back definition. If artifacts appear, I lower it; if it looks too soft, I increase it slightly for sharper results.

Wave Count:
This comes after setting wavelength and amplitude.

If performance budget is limited, use fewer waves, such as 8 to 16. Then increase the frequency ratio gradually until the smallest waves still add nice detail. Without enough small waves, the surface looks too uniform.

If performance allows, use 32 to 64 waves. In this case, low frequencies can become too dominant, so I lower the frequency ratio to make small waves larger and more visible.

Frequency / Spectrum Ratio:
Controls how much each wave’s wavelength and amplitude are reduced relative to the previous one. Typically between 1.0 and 2.0, closer to 1 gives a more coherent profile, while closer to 2 makes waves flatter and more stretched.

If we decide not to automate this setup and instead rely on manual tweaking, here’s how it can be approached and evaluated.

Let’s say we have 8 waves.

Pick one as the leader wave. This wave defines both the overall direction and the maximum values.

Set the leader wave parameters.
Wavelength:
For calm or coastal waters, use 1 to 60 meters. (1 is usually too small since the following waves will be even smaller.)
For stormy or deep waters, use 45 meters or higher.
Observe the results. If the surface still looks too calm or static for coastal scenes, slightly increase the value to add more visible movement.
Amplitude:
Choose a value that looks visually appealing when observing the leader wave in motion.

For the remaining waves, assign values manually by reducing each one’s wavelength and amplitude compared to the leader. The reduction can follow a rough ratio between 1 and 2, depending on how fast you want the smaller waves to scale down.
For directions, divide the waves into bands that each contain an odd number of waves, and distribute the directions evenly around 360 degrees within each band.

After setting all the waves, adjust the steepness and the world space multiplier together until the overall motion and wave sharpness look natural and fluid. At this stage, you can also make small manual tweaks to amplitude or wavelength if certain areas look too repetitive or flat.