> This post is a backup of the [substack post](https://ricardohs.substack.com/p/how-to-start-learning-shaders-from?utm_campaign=post&utm_medium=web)

# How to start learning shaders from a programmer perspective

![](./media/shaders_1.gif)

*Shader of the week in [shadertoy.com](https://www.shadertoy.com/view/7lKSWW) by mrange.*

Learning shaders from a programmer perspective can be next to impossible. This is the conclusion I have come after one week of learning shaders from myself.
Although I am an experienced machine learning engineer, I have seen a fairly high knowledge bar that, from my point of view, not all programmers are willing to exceed. 
There are a set of reasons about why this is the case. In this post I summarize them.

## Free available resources are not friendly enough

There are a bunch of different resources out there to learn shaders. None of them are easy enough. [The book of shaders](https://thebookofshaders.com/), one of the most famous and the one I'm using. It's a great resource but in each chapter it leaves too much effort on the reader side to be discover by themselves. Other resources, like the one from [learnopengl.com](https://learnopengl.com/Getting-started/Shaders), require even more knowledge to understand. Without proper guidance one can very easily get lost and lose the motivation to continue the journey.

In this week learning shaders I have spent more time searching through internet and trying small changes in the code examples than reading the book. Most of the time I was able to continue due things I already know from machine learning. If I had had to use these resources when I was studying at university or in my first professional years, I simply would not have been able to continue. In fact, it happened to me a few years ago. It's not the first time I've tried to learn about shaders.

If you come from math or physics, it's relatively easy to start though. The way of facing problems when writing shader code are aligned with those fields. It's very straightforward to jump from algebra and trigonometric to shaders. This is not the case for a programmer.

## Shaders requires you to start thinking in a functional way

When someone start learning programming, most of the times they learn from the imperative way. That is, programs in which their definition are clauses that mandates the computer exactly what to do; "Sum these two numbers", "Assign this value to this variable", "If this, then that", etc. After having experience with this type of coding, some of them try to learn new paradigms. Declarative is a family of them. SQL, for instance, is a type of declarative language. Functional programming is another type of declarative paradigm.

Despite the efforts, learning a new declarative paradigm can be so difficult most of the programmers did not make the though exercise and they never gain the skill. I understand them. Learning a new paradigm forces you to face problem solving in a different way you are used to. This can be very exhausting when you start.

When you write shader code you use an imperative syntax, but the way it's applied is functional. This makes things even more complex.

For instance, Python lambdas are an example of declarative programming, despite the language being mainly imperative. Lots of python programmers do not use lambdas at all, because they do not understand them. Others just copy-paste the code from stackoverflow, check it works and continue with the next thing. This is quite sad, because indeed, functional programming is quite straightforward to think. It's more close to the school maths and problem reasoning than any other aspect in computer science.

If you continue without understanding the difference between imperative and functional programming, just go and check haskell code against python. Haskell is a pure functional programming language so there is no way of being confused like with python.

To finally understand it better here is a simplistic implementation on how the complete execution of the shader code would look using python syntax. If you still have no idea what a shader is, first [read this](https://thebookofshaders.com/01/).

```python
# Shader code is executed against a collection of pixels.
# Like the ones in an image or screen.
# In this example we have an narray of dim 512x512.
pixel_values = [[1,2,3,...],[1,2,3,...],...]
width = 512
height = 512

def shader_function(pixel_value):
    # the shader code, not important at this moment
    ...
    # just note how the function takes one pixel value
    # and returns another pixel value
    return pixel_value

# Loop to execute the shader code
while True:
    for w in range(image_width):
        for h in range(image_heigh):
            pixel_values[w][h] = shader_function(pixel_values[w][h])
```

In a nutshell, this is the logic. Despite the fact that this code is completely sequential. Each new pixel value is computed only after the previous one have been computed. This loop has 512x512=262144 iterations, so this piece of code could take a considerable time to finish.

This is not the case for shaders. With shaders all pixels are computed nearly at the same time. It's like taking these 262144 iterations and execute them all at once. This is possible thanks to the GPU, that contains a lot of little processors that execute each of these iterations concurrently. As you may be wonder, there is no way of parallelize this chunk of code, so a more precise way of writing this shader execution code logic in python would be like this.

```python
pixel_values = [[1,2,3,...],[1,2,3,...],...]

def shader_function(pixel_value):
    # the shader code, not important at this moment
    ...
    # just note how the function takes one pixel value
    # and returns another pixel value
    return pixel_value

while True:
    pixel_values = map(shader_function, pixel_values)
```

This piece of code now uses a functional paradigm despite `shader_function` being imperative. Python uses functional paradigms through `map()` calls ([among others](https://docs.python.org/3/howto/functional.html)). These functions are the ones that allows python to parallelize all the little calls to `shader_function`.


## Shaders require you to start understanding mathematics (once and for all)

Let's be honest, most of programmers do not like maths and I'm not going to lie you. Learning shaders requires you to learn and understand maths. There is no easy way.

You need to force yourself and start thinking. It could be very difficult at the beginnings, I know. The good part is that once you brain makes "the click" programming and thinking this way it's very satisfying.

Doing "the click" is like that moment when you were learning programming, nothing made sense but suddenly, one day, you become seeing how everything fits, like a puzzle. Learning shaders is the same, but in a different way. Do not give up, the reward is so satisfying that it's ineffable.

To set the record straight, you will need to learn and really understand trigonometric and algebra. The first one is easy, a couple of videos of [khan academy](https://en.khanacademy.org/math/trigonometry) will set you on track. Algebra can be more tricky, luckily we have the course of the brilliant professor Gilbert Strang in the MIT [freely available](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/video_galleries/video-lectures/).

You do not need to complete these courses to start learning shaders, but at some moment you will need them. Keep those links secret. Keep them safe.

## Ok, but what now?

This is the first in a series of planned posts in which I'll be explaining my journey learning shaders using [The book of shaders](https://thebookofshaders.com/).

If you want to learn shaders too, please, start reading that resource first. It's possibly the best resource from an entrypoint perspective. If you feel overwhelmed come back and I'll be filling the gaps with deep explanations and some exercises that are more narrowed and require less of you.

Or if you want, you can [subscribe to my newsletter](https://ricardohs.substack.com/?r=1k58g7&utm_campaign=pub-share-checklist) to stay up-to-date when new post are published.
