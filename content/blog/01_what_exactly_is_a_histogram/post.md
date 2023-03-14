# What exactly is a histogram?

This simple question allows you to know if someone really understands statistics. In this post you will learn why.

## A problem that goes unnoticed

When talking with colleagues or when reading people in websites like kaggle, there is always a smell, a feeling that only some persons notice. Lot of people that works with data does not understand stats. Even some stats students does not really understand it.

There are several reasons why this happens and everyone have his own opinion about them: stats is badly taught, people does not care about learning it property, it's difficult, etc. For me, it is clear. Most of the stats students fail to pay attention to one key concept most of the times taught on the first day or first stats lectures. In non maths related bachelors this key concept is sometimes not mentioned at all. I'm talking about the statistical framework, this is in other words, the philosophical idea behind statistics. When you know this, then you are able to understand, among other things, why statistics is so widely used in all scientific areas.

Although this is a problem most of the times goes unnoticed, it is very easy to detect it on a person. You only have to ask, "What exactly is a histogram?" and see their answer. Most of the people answer incorrect or incomplete things, giving importance to the histogram construction rather than the purpose. Even the [histogram wikipedia page](https://en.wikipedia.org/wiki/Histogram) gives an incomplete explanation. Some common answers are:

 - It is a bar plot that counts data.
 - It is a way to know the distribution of the data.
 - It is a thing used in statistics.
 - Son, why are you asking me this?

In my opinion, all these kind of answers are incorrect or incomplete. For me, a minimal valid definition is:

 > A histogram is an **estimator** of a **population density function**. This estimation is performed using **data** collected from a **population sample**.

This explanation contains all the key concepts that tells me the person who answers really understands what is talking about. It is not telling you how to construct a histogram, but it is telling you what a histogram really is. A estimator.

If you have not understood anything or you miss some of the concepts in bold, don't worry. Let's review them.

## The statistical framework core concepts

Probably, you are familiar with the concepts mentioned on the definition, but you fail to explain on detail [when someone constantly ask you "why"](https://youtu.be/u-Z2CtxFPdg?t=34). If this is your case, it's probably you don't know one key concept about statistics. Indeed, it's THE key concept on statistics. I'm talking about the [**data generating process**](https://en.wikipedia.org/wiki/Data_generating_process). 

It's okay if you don't know what this is, you've probably forgotten. As I have mentioned before, this is something that is usually explained in the first classes of statistics and then rarely mentioned again. After all, who cares about philosophical foundations in a math class? After I explain what this is, you will be able to fully understand all the other concepts.

### Data Generating Process

If you really paid attention at school (I didn't) you will have realized that in math classes the problems you had to solve were hypothetical problems that could happen to you in real life. For example, a very common problem was trying to distribute an exact amount of candy to your friends. For this you had to express the problem in a simplified language (mathematics) and only then through this simplified representation of reality could you finally solve the problem of distributing the candies.

This process of representing reality in mathematical terms, called modeling, was done with the objective to show you the usefulness of the subject. The aspect to notice was, all these models always had one aspect in common. All aspects of reality were perfectly known. That is, you always knew how many candies you had to distribute and how many friends you had. But what if you don't know exactly how many candies you have to distribute?

These kinds of questions are what led to the creation of statistics. Before this, when it was necessary to model an aspect of reality for which all the factors involved were not known, it simply could not be solved. There was no way to express in mathematical language the idea of ​​picking up a random child on the street, looking in his pockets, and counting how many pieces of candy he had. And since there was no way to express this idea (to model it), then there was no way to study it.

Why do I tell you all this? So that you become familiar with the idea of ​​modeling an aspect of reality (to which from now on we will call it "a process") and the importance it has in mathematics. In pure mathematics this is not really necessary, but in statistics it is vital to know that we are always modeling a process that we do not know everything about. In order to do such a thing, the only thing that we have managed to think as humankind is to make measurements in the process to obtain something that we call data. All of this is what we call the data generating process. Here is a diagram to summarize it.

# Structure

 - The problem (most of the students does not really understand stats)
 - Definitions. What people usually said. What a histogram really is.
 - Concepts explanation. [data generating process, population, density function, sample, data, estimator]
 - What stats is. Why it is so useful.
 - Histogram explanation
 - Conclusion. Now you know the Stats framework something taught on the first stat classes and something most stats students fails to understand. Now you know how to know if someone really understand this with one simple question. Now you are really prepared to correctly start learning stats.