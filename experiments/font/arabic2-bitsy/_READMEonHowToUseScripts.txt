README on how to use the provided scripts to create an Arabic bitsyfont

Steps:
1- install "ttx-to-ttf" https://github.com/fonttools/fonttools
2- Name your font file "bitsy-with-arabic.ttf"
3- Run the provided file "CommandsRun.bat" in this directory
The bat file will input "bitsy-with-arabic.ttf" and output a file named "arabic2.bitsyfont"

ttx bitsy-with-arabic.ttf
node ttx_to_bitsyfont.js

----
Some problems you might run into:
- The script "ttx_to_bitsyfont.js" works when every visual pixel is a multiple of 512.
So a typical font that's 8 pixels high would have an em of 4096. As in 512x8

- The script "ttx_to_bitsyfont.js" works best when your glyphs
are above the underline. but that's not a good way to design a font.
You could create an alternative version of your font
where every character is above the underline.

You can do this in FontStruct like this:
1- Select every glyph (ctrl+A)
2- Press (ctrl+\). Or go to Element > Transformations > Transfom
3- Move the glyphs in the y axis in mulitples of 512 units for each
visual pixel. Example: 2 pixels would be y=1024
