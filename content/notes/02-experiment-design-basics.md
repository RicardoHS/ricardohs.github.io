# Experimental Design Basics

Here you can find my notes on the Arizona State University online coursera course [Experimental Design Basics](https://www.coursera.org/learn/introduction-experimental-design-basics) by Douglas C. Montgomery. This is the first part (out of four) of a specialized program [Experimental Design](https://www.coursera.org/specializations/design-experiments). Proprietary computer software packages (JMP, Design-Expert, Minitab) are used in the course. The lectures are based on the book [Design and Analysis of Experiments, 10th Edition](https://www.wiley.com/en-us/Design+and+Analysis+of+Experiments%2C+10th+Edition-p-9781119492443)

This course aims to explain the basics of scientific experimental design and results analysis using statistical tools. It does not only aims to explain the mathematical foundations but also to plan, design and conduct experiments efficiently and effectively.

## Course Index

1. Introduction to Design and Analysis of Experiments
2. Simple Comparative Experiments
3. Experiments with a Single Factor - The Analysis of Variance
4. Randomized Blocks, Latin Squares, and Related Designs

## Introduction to Design and Analysis of Experiments

The branch obviously originates with Ronald Fisher. In the mid decade of 1910, Fisher described the principal concepts of the field even nowadays, namely:

 - Randomization, running experiments on a random order.
 - Replication, repeating experiments to gain knowledge about experimental error.
 - Blocking, a technique to control variation in the experiments when dealing with noise or nuisance variables.

Among these, he also developed the techniques of factorial design and analysis of variance. Regarding the analytical methods, this course talks about two-sample t-test (to compare two levels of a factor) and the analysis of variance, a generalization of the previous technique that allows to compare in any kind of experiment.

Finally, the course will talk about a procedure of seven steps to conduct a well-design experiment.

### Definition

As a formal definition, an experiment is a test or a set of inter-related tests that aims to explain the variation of information that depends to a hypothesized set of variables.

> All experiments are design experiments. Some of the are poorly design, some are well-designed

If an experiment is poorly design, you can get incomplete or incorrect conclusions.

Some application examples can be:

 - Reduce **time** to design/develop new products or processes.
 - Improve **performance** of existing process.
 - Evaluation of materials, processes, products, etc.

You can think of an experiment as a black-box system, in which it receives an input and gives out an output. The system is affected by some factors, some of them are controllable while others are not. In an experiment, we try to manipulate those factors to see if we can understand their implications in the way they change the output.

![](media/dei_1.png)

### Principles of DOE

These are the three principles that any well-design experiment need to handle correctly, always.

#### Randomization

Randomization involves running the trials of an experiment in random order. So for example, it would be convenient on a system to run trials of low temperature first and high temperature last. This is an error.

The problem here is, if there are factors you don't know impacted by time, then you will be linking your temperature changes to these **lurking variables**. So the experiment would not valid.

On summary, without randomization statistical tools does not work.

#### Replication

Basically, setting a sufficient **sample size**. By doing so, what you want to accomplish is a experiment with the enough probability to **correctly detect** an effect size of practical value. If the sample size is low, then we could be not sure if the desired effect to detect exists or we weren't able to detect it.

#### Blocking

The technique that allow us to deal with **nuisance factors**. These factors are the ones present on the experiment, that gives no information but need to be handled.

### Strategies of experimentation

How can we start when doing experiments?

#### "Best-guess" experiments

Relying on expert knowledge, a simple "guess" on which factor to try on a experiment. As in the previous example, it's so simple as "let's try with temperature". A disadvantage could happen when no successful experiment occur in a long period of time.

#### One-factor-at-a-time (OFAT)

By setting a baseline level for all your factors, you perform the experiment in several trials by setting constant to their baseline all the factors except one, this one is the one you change in their range. After this trial, you set again this factor to the baseline and try with a different factor. This is extremely inefficient and have lots of disadvantages too. If there is any interaction between factors or the baseline level you set have effect on the system, then your experiment is invalid.

#### Factorial Design

Based on the Fisher's factorial concept these are the statistics designed experiments. If we have multiple factors, we perform trials on all possible value combinations of such factors. 

e.g. If we try to measure the effect of changing from two driver types and two ball types on a golf game, then we will need to perform several trials on games, by changing the drivers and balls **on random order**. This experiment will have two factors with two levels each. After the experiment, we will take the mean differences by driver, ball and interactions of driver-balls. So at the end we will measure three different effect, the driver, the ball and the interaction between both. This can be extended to any experiment with any number of factors and levels.

### Steps of an experiment

These are the seven steps recommended by Montgomery. Conducting an experiment is something you have to follow a strategy in order to succeed. It's crucial you take ownership on this process but try to perform team work. The first three points should take you 80% of your time.

1. **Recognition of the problem**: "This is what we want to accomplish with this particular experiment".
2. **Choose the factors**: The number of levels and ranges of those factors and nuisance factors. Keep the levels low, two or three.
3. **Selection of the response variable**: What are you going to measure? In the last example it was the game score.
4. **Choose the design**: Mainly the software you are going to use.
5. **Conduct the experiment**: As an advise from Montgomery. Conduct the experiment by yourself and if you can't, just be there when it happens. Lot's of thing go wrong during this part.
6. **Analyze the data**: With modern software this is quite easy if everything before have been done correctly. No statistical tool will help you if the experiment is not well-design.
7. **Draw conclusions**: Graphics helps a lot when communicating the results. They are preferred over complex variance tables.

As a final advise, Montgomery say to use the KISS principle. "Keep it simple and sequential". Large experiments often fails because we don't know enough the system when experiment design starts. We learn when conducting multiple experiments. So it's better to run multiple sequential small experiments rather than one large complex experiment.


## Simple Comparative Experiments

