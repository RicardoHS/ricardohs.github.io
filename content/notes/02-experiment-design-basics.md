# Experimental Design Basics

Here you can find my notes on the Arizona State University online coursera course [Experimental Design Basics](https://www.coursera.org/learn/introduction-experimental-design-basics) by Douglas C. Montgomery. This is the first part (out of four) of a specialized program [Experimental Design](https://www.coursera.org/specializations/design-experiments). Proprietary computer software packages (JMP, Design-Expert, Minitab) are used in the course, but in these notes you can find the equivalent procedure in python. The lectures are based on the book [Design and Analysis of Experiments, 10th Edition](https://www.wiley.com/en-us/Design+and+Analysis+of+Experiments%2C+10th+Edition-p-9781119492443)

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

One thing you want to do when experiment data arrives is to visually inspect the actual data. Apart from the datatable, you will also want to use visual plots. Three of the best plots you can use to inspect the data are:
 - Scatter plots: If n is low than 30. Plotting the values differentiating by color is a good idea.
 - Histograms: If n is larger than 30. An histogram can gives you a lot of information about the data distribution.
 - Box plots: Very useful to visually compare between two distributions. Min, max, 25-75 percentile and median is present. Sometimes outliers can also be drawn.

From these plots, you will always want to see the mean and the standard deviation and compare between the samples of the experiment. Nevertheless, this way of discern if there are differences between two experiments is not so scientifically. In order to do it properly we used the hypothesis framework.

### Hypothesis framework

The hypothesis framework is a way of reductio ad absurdum reasoning. Here we will assume an initial condition of a system with just two possible disjoint states. If one state is true, then the other one is false. An example of such system could be if a person have siblings (one of the states) or not (the other one). 

In this scenario, we will take one of the states as true, the null hypothesis $H_0$, and then we will try to prove it is false with a level of certainty. If we succeed, then we will reject the null hypothesis and take the alternative one. If we fail, then we do not reject the null hypothesis.

> Note: With this framework we cannot be 100% sure of rejecting or assuming anything. Thats why we use a small enough confidence value.

The mathematical procedure to perform this reasoning is called two sampled t-test. With this procedure we assume that the two factor levels of the system are sampled from a **normal distribution**. 

![](media/dei_2.png)

Then we define the two hypotheses:

$$
H_0 : \mu_1 = \mu_2 \\
H_1 : \mu_1 \neq \mu_2
$$

**Null hypothesis**: Population means of the two level factors are equal.

**Alternative hypothesis**: Population means of the two level factors are not equals.

### Two-sample T-test

To perform the actual test, we need first to estimate the population parameters. 

$$
\bar{y} = \frac{1}{n} \sum_{i=0}^n y_i \\
S^2 = \frac{1}{n-1} \sum_{i=0}^n (y_i - \bar{y})^2
$$

$\bar{y}$ estimates the population mean $\mu$ and $S^2$ estimates the population variance $\sigma^2$. Both are called sample mean and sample variance.

The tests use the sample means to draw conclusions about the population means. Taking the differences of sample means and dividing it by the standard deviations of the differences of sample means we will have a new statistic. With the new statistic we can quantify how likely it is to have such mean differences (in case the null hypothesis is true).

$$
\frac{\text{differences in sample means}}{\text{standard deviation of the differences in sample means}}
$$

This ratio is a measure of how different are the sample means in standard deviation units.

The **standard deviation of an average** is defined as:

$$
\sigma_y^2 = \frac{\sigma^2}{n}
$$

And the **standard deviation of the differences of two averages** is defined as the sum of the std of the averages:

$$
\sigma_{y_1-y_2}^2 = \frac{\sigma_1^2}{n_1} + \frac{\sigma_2^2}{n_2} \text{, if $y_1$ and $y_2$ are independent}
$$

With these definitions we can already plug-in everything to get the statistic to perform the test. In other words we get the standard deviation of the differences of sample means.

$$
Z_0 = \frac{\bar{y}_1 - \bar{y}_2}{\sqrt{\frac{\sigma_1^2}{n_1} + \frac{\sigma_2^2}{n_2}}}
$$

If $\sigma_1^2$ and $\sigma_2^2$ are known to be equal, then the $Z_0$ statistic follows a normal distribution $N(0,1)$. In this scenario it will be straightforward to measure how likely is to get those mean differences.

```python
# draw samples from a normal distribution
from scipy import stats
g1 = stats.norm.rvs(size=10)
g2 = stats.norm.rvs(size=10)

# perform ztest
from statsmodels.stats import weightstats
tstat, pvalue = weightstats.ztest(g1, g2, alternative="two-sided")
```

To do that, just measure where the $Z_0$ statistic value lands on the $N(0,1)$ distribution. If it lands on a unlikely place, then we will assume it wasn't because of chance but because the means are not equal, thus we will reject the null hypothesis and take the alternative one.

> Example: Take an experiment that yields you the following values: $\sigma_1^2=\sigma_2^2=0.3$, $\bar{y_1}-\bar{y_2}=-0.28$ and $n=10$. Plug in the values and you will get $Z_0=-2.09$. How unlike is to get that $Z_0$ value? The 95% of the $N(0,1)$ area is between the values $Z_{0.025}=1.96$ and $-Z_{0.025}=-1.96$ so the $Z_0$ we get is outside that range. In other words, 95% of the times we will not get such value in the differences of means if means are equal. So we reject the null hypothesis, in this case, with a 5% of significance.

This type of test, is called fixed significance level test, because we compare the t-statistic value to a **critical value** (1.96) selected before running the experiment.

#### The P-value

Testing using a p-value instead a critical value is very popular. The computation is quite easy for the t-test. Just take the probability in $N(0,1)$ of your $Z_0$ value and multiply by two. Multiplying by two is needed because this test is a two-tailed test.

![](media/dei_3.png)

In science and engineering fields is quite common to use p-value=0.05 as a rule of thumb. Nevertheless, Montgomery recommends to use higher p-values, like 0.1 or even 0.15, in early stages of an experiment when you will be doing new discoveries. Performing Type I errors, that is, assuming a factor level is important when it's not, is not so important at early stages. In the end you will find a factor level is not important in case you make an error. On the other hand, Type II errors, rejecting factor levels when they are important, are devastating at early stages of experimentation because they will be discarded forever.

> Example: In the previous example, $Z_0=2.09$ give us a probability of $0.01832$, if we multiply by 2 we get $0.03662$. Because this is lower than p-value $=0.05$ we reject the null hypothesis.

The z-statistic is usually used to represent the sample values in terms of zscore. The zscore measure how far are the sample values from the mean in terms of standard deviation.

```python
# compute the zscores of a sample
stats.zscore(g1)
```

#### What if we don't know the population variance?

If we don't know $\sigma^2$ then we can plug in the sample variance $S^2$ only if the sample size $n$ is greater than 30 or 40. In other words, the Z-statistic is a good statistic only for large samples.

#### What if the sample size is small?

If the sample size is lower than 30, then we cannot use the $N(0,1)$ distribution as a groundtruth. Instead, we will use the t-statistic and the sample variances. This is called **pooled two-sample t-test**. Because we are assuming both sample variances are equal, the t-statistic formula will be:

$$
t_0 = \frac{\bar{y}_1 - \bar{y}_2}{S_P\sqrt{\frac{1}{n_1} + \frac{1}{n_2}}}
$$

with $S_p$ being called **pooled standard deviation** it's computed from the root square of

$$
S_p^2 = \frac{(n_1-1)S_1^2+(n_2-1)S_2^2}{n_1+n_2-2}
$$

This statistic can be interpreted as a signal-to-noise ratio. The numerator would be the signal, and the denominator would represent the variance or noise. Again, the statistic measure how far are the sample means in terms of sample variances. 

So if we get a t-statistic value of -2.20 then we can interpretive as the two sample means are more than 2 standard deviation apart one from the another. But, How unusual is to get this value? In this case, to answer the question we need to use the t-distribution.

```python
# sample from a t-distribution
stats.t.rvs(df=6, size=10)
```

The t-distribution is quite similar to the normal distribution, but it have a little more of spread in the tail. The spread is controlled by the degrees of freedom. The **degrees of freedom* are $n_1+n_2-2$.

With this in mind, we can perform the same procedure as the one with the Z statistic.

```python
# perform two-sample t-test
t_statistic, p_value = stats.ttest_ind(g1, g2, equal_var=True, alternative="two-sided")

# complete test using statsmodels
d1 = weightstats.DescrStatsW(g1)
d2 = weightstats.DescrStatsW(g2)
test = weightstats.CompareMeans(d1, d2)
print(test.summary())
#                           Test for equality of means                          
# ==============================================================================
#                  coef    std err          t      P>|t|      [0.025      0.975]
# ------------------------------------------------------------------------------
# subset #1      0.9588      0.427      2.248      0.037       0.063       1.855
# ==============================================================================
```

#### Checking assumptions of the test

It's important to always check the assumptions. Mainly, the normality of samples and equal variances. One way to easily check this assumption is just plot as probplot for the two samples. In this plot, if points are close to the line then normality holds. If both lines slopes are close to be parallel then both samples have the same variance.

The normality assumption is not so important. If both distributions are symmetric and unimodal the t-test works well. If equal variability is not hold, then the test lacks of sensitivity and therefore it would not be able to detect any differences in the effects.

```python
# plot probplot
import matplotlib.pyplot as plt

stats.probplot(g1, plot=plt)
stats.probplot(g2, plot=plt)
plt.show()
```

![](media/dei_5.png)

#### What if the variances are not equal?

If variances of the sample are not equal, then we cannot use the previous methods. Instead we will just plug in the sample variances in the z-statistic formula.

$$
Z_0 = \frac{\bar{y}_1 - \bar{y}_2}{\sqrt{\frac{S_1^2}{n_1} + \frac{S_2^2}{n_2}}}
$$

The problem here is that the statistic is no longer distributed exactly as a t-distribution. A little adjustment in the degrees of freedom need to be performed.

$$
v = \frac{(\frac{S_1^2}{n_1} + \frac{S_2^2}{n_2})^2}{\frac{(S_1^2/n_1)^2}{n_1-1} + \frac{(S_2^2/n_2)^2}{n_2-1}}
$$

The new statistic follows approximately a t-distribution with $v$ degrees of freedom. This test is called **Welch's t-test**.

```python
# perform welch's t-test for unequal variances. Note the false in the parameters
t_statistic, p_value = stats.ttest_ind(g1, g2, equal_var=False, alternative="two-sided")
```

### One-sample t-test

There are sometimes we want to perform a test with only one sample, comparing the population mean $\mu$ to a predefined value $\mu_0$. In these cases the predefined value is usually a threshold, acceptance level, boundary, etc. The hypotheses are:

$$
H_0: \mu = \mu_0 \\
H_1: \mu \neq \mu_0 \\
$$

and the formula for the statistic is

$$
Z_0 = \frac{\bar{y}-\mu}{\sigma / \sqrt{n}}
$$

The procedure is similar to the previous methods because this statistic also follows a $N(0,1)$ distribution.

#### What if we don't know the population variance on the one-sample t-test?

As in the previous methods, we just plug-in the sample standard deviation:

$$
Z_0 = \frac{\bar{y}-\mu}{S / \sqrt{n}}
$$

Here, the new statistic also follows a t-distribution with $n-1$ degrees of freedom. After this, the procedure is similar as the previous one for two-sample t-test with unknown population variance.

### Test on variances, F-test

These tests are called F-tests but they are not mentioned on the course. These tests are usually used when performing OLS and linear model fitting well-of-fit test. [See more in the wikipedia page.](https://en.wikipedia.org/wiki/F-test)

### Paired t-test

There are sometimes you will want to perform a test on different machines, persons or any pair of things. The paired t-test is also known as the dependent samples t-test, the paired-difference t-test, the matched pairs t-test and the repeated-samples t-test.

Examples for use are scores of the same set of student in different exams, or repeated sampling from the same units. For example, you want to know if two machines that apparently perform the same cut on a piece of metal actually perform it with the same level of quality. In this scenario you can take 20 pieces of metal and perform the cuts in 10 pieces with one machine and the other 10 cuts with the other one. This have a great disadvantage, the called **block effect**. That is the characteristics of each piece of metal affects the way in which the cut is performed. In other words, the result variability will be greater due the block effect.

A way to reduce this effect is to perform the cut on the 20 pieces but with the two machines. This way, we can compare two different cuts on each of the metal pieces, reducing this way the effect of the metal particular characteristics.

With this in mind, the experimental design will be to perform a paired t-test on the differences of measurement pairs. In the example, instead of taking the measurement in metal piece 1 for cut1 and cut2, we perform cut1 $-$ cut2 for metal piece 1 and repeat for all the metal pieces.

The hypotheses will be:

$$
H_0 : \mu_d = 0 \\
H_1 : \mu_d \neq 0
$$

with the test statistic

$$
t_0 = \frac{\bar{d}}{S_d \sqrt{n}}
$$

being $\bar{d}$ the sample mean of differences and $S_d$ the sample standard deviation of the differences

$$
\bar{d} = \frac{1}{n} \sum_{j=1}^n d_j \\
S_d = \sqrt{ \frac{\sum_{j=1}^n (d_j - \bar{d})^2}{n-1}  }
$$

From here, the way of proceeding is similar as in the two-sample t-test. The statistic will follow a t-distribution with $n-1$ degrees of freedom. Also take care to check for normality in the differences.

Note that this approach have a lot of advantages, so it's preferred over normal two-sample t-test when possible.

```python
# paired t-test
# Note: ensure order of p1 and p2 is correct
t_statistic, p_value = stats.ttest_rel(p1, p2, alternative="two-sided")
```

