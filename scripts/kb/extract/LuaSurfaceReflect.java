/*
 * LuaSurfaceReflect: lists what Kahlua's exposer hands to Lua, by asking the JVM the same
 * questions the exposer asks. Part of scripts/kb/extract/extract-lua-surface.ts, which compiles
 * and runs it; it is not meant to be run on its own.
 *
 * It mirrors se.krka.kahlua.integration.expose.LuaJavaClassExposer as shipped in the game jar
 * (read with javap): instance methods come from Class#getMethods() (public, inherited and
 * interface default methods included) minus @HiddenFromLua and minus statics; statics,
 * public static fields and public constructors come from exposeStatics, which is skipped for
 * synthetic, anonymous, primitive and proxy classes and simple names starting with "$";
 * a class annotated @HiddenFromLua is never exposed (isDisallowed). Global functions are the
 * methods of LuaManager$GlobalObject carrying @LuaMethod(global = true), named by the
 * annotation's name (the Java name when it is empty).
 *
 * Classes are loaded with initialize=false and @HiddenFromLua is read from the class-file
 * bytes (not through the annotation API, which would initialise enum classes): no game code
 * runs. Output is names and types only.
 *
 * Usage: java -cp <compiled dir> LuaSurfaceReflect <game jar> <class list file> <out json>
 */
import java.io.File;
import java.io.IOException;
import java.lang.annotation.Annotation;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Proxy;
import java.lang.reflect.Type;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

public class LuaSurfaceReflect {
    private static final String HIDDEN = "Lzombie/HiddenFromLua;";
    private static Class<? extends Annotation> luaMethod;

    public static void main(String[] args) throws Exception {
        if (args.length != 3) {
            System.err.println("usage: LuaSurfaceReflect <game jar> <class list file> <out json>");
            System.exit(2);
        }
        URLClassLoader loader = new URLClassLoader(new URL[] {new File(args[0]).toURI().toURL()},
                LuaSurfaceReflect.class.getClassLoader());
        luaMethod = loadAnnotation(loader, "se.krka.kahlua.integration.annotations.LuaMethod");

        List<String> names = new ArrayList<>();
        for (String line : Files.readAllLines(Path.of(args[1]), StandardCharsets.UTF_8)) {
            String s = line.trim();
            if (!s.isEmpty()) names.add(s);
        }

        StringBuilder out = new StringBuilder();
        out.append("{\n\"classes\": [\n");
        boolean first = true;
        for (String name : names) {
            if (!first) out.append(",\n");
            first = false;
            try {
                Class<?> c = Class.forName(name, false, loader);
                StringBuilder one = new StringBuilder();
                writeClass(one, c);
                out.append(one);
            } catch (Throwable t) {
                out.append("{\"binaryName\": ").append(q(name)).append(", \"error\": ")
                        .append(q(t.getClass().getName() + ": " + t.getMessage())).append("}");
            }
        }
        out.append("\n],\n\"globals\": ");
        writeGlobals(out, Class.forName("zombie.Lua.LuaManager$GlobalObject", false, loader));
        out.append("\n}\n");
        Files.writeString(Path.of(args[2]), out.toString(), StandardCharsets.UTF_8);
    }

    @SuppressWarnings("unchecked")
    private static Class<? extends Annotation> loadAnnotation(ClassLoader loader, String name) throws ClassNotFoundException {
        return (Class<? extends Annotation>) Class.forName(name, false, loader);
    }

    /** LuaJavaClassExposer.isDisallowed for a class, outside debug mode. */
    private static boolean disallowed(Class<?> c) {
        while (c.isArray()) c = c.getComponentType();
        if (c.isPrimitive()) return false;
        if (classHidden(c)) return true;
        String pkg = c.getPackageName();
        return pkg.equals("java.lang.invoke") || pkg.equals("java.lang.reflect") || ClassLoader.class.isAssignableFrom(c);
    }

    private static boolean staticsExposed(Class<?> c) {
        return !c.isSynthetic() && !c.isAnonymousClass() && !c.isPrimitive() && !Proxy.isProxyClass(c)
                && !c.getSimpleName().startsWith("$");
    }

    private static String kind(Class<?> c) {
        if (c.isAnnotation()) return "annotation";
        if (c.isInterface()) return "interface";
        if (c.isEnum()) return "enum";
        if (c.isRecord()) return "record";
        if (Modifier.isAbstract(c.getModifiers())) return "abstract class";
        return "class";
    }

    private static void writeClass(StringBuilder out, Class<?> c) {
        out.append("{\"binaryName\": ").append(q(c.getName()));
        out.append(", \"kind\": ").append(q(kind(c)));
        out.append(", \"disallowed\": ").append(disallowed(c));
        out.append(", \"staticsExposed\": ").append(staticsExposed(c));
        out.append(", \"superclass\": ").append(c.getSuperclass() == null ? "null" : q(c.getSuperclass().getName()));
        out.append(", \"interfaces\": [");
        Class<?>[] ifs = c.getInterfaces();
        for (int i = 0; i < ifs.length; i++) out.append(i == 0 ? "" : ", ").append(q(ifs[i].getName()));
        out.append("]");
        List<Class<?>> chain = new ArrayList<>();
        for (Class<?> s = c.getSuperclass(); s != null; s = s.getSuperclass()) chain.add(s);
        out.append(", \"superChain\": [");
        for (int i = 0; i < chain.size(); i++) out.append(i == 0 ? "" : ", ").append(q(chain.get(i).getName()));
        out.append("]");

        Method[] ms = c.getMethods();
        Arrays.sort(ms, Comparator.comparing(Method::getName).thenComparing(Method::toGenericString));
        int hiddenCount = 0, bridgeCount = 0;
        out.append(", \"methods\": [");
        boolean first = true;
        for (Method m : ms) {
            if (memberHidden(m.getDeclaringClass(), m.getName(), descriptor(m.getParameterTypes(), m.getReturnType()))) { hiddenCount++; continue; }
            if (!Modifier.isPublic(m.getModifiers())) continue;
            boolean isStatic = Modifier.isStatic(m.getModifiers());
            if (isStatic && !staticsExposed(c)) continue;
            if (m.isBridge() || m.isSynthetic()) { bridgeCount++; continue; }
            out.append(first ? "\n  " : ",\n  ");
            first = false;
            out.append("{\"name\": ").append(q(m.getName()));
            out.append(", \"static\": ").append(isStatic);
            out.append(", \"params\": ").append(types(m.getGenericParameterTypes(), m.isVarArgs()));
            out.append(", \"returns\": ").append(q(typeName(m.getGenericReturnType())));
            out.append(", \"declaredBy\": ").append(q(m.getDeclaringClass().getName()));
            out.append("}");
        }
        out.append("]");
        out.append(", \"hiddenMethods\": ").append(hiddenCount);
        out.append(", \"bridgeMethods\": ").append(bridgeCount);

        out.append(", \"staticFields\": [");
        first = true;
        if (staticsExposed(c)) {
            Field[] fs = c.getFields();
            Arrays.sort(fs, Comparator.comparing(Field::getName));
            for (Field f : fs) {
                if (memberHidden(f.getDeclaringClass(), f.getName(), descriptor(f.getType())) || !Modifier.isPublic(f.getModifiers()) || !Modifier.isStatic(f.getModifiers())) continue;
                out.append(first ? "" : ", ");
                first = false;
                out.append("{\"name\": ").append(q(f.getName())).append(", \"type\": ").append(q(typeName(f.getGenericType())))
                        .append(", \"enumConstant\": ").append(f.isEnumConstant()).append("}");
            }
        }
        out.append("]");

        out.append(", \"constructors\": [");
        first = true;
        if (staticsExposed(c)) {
            Constructor<?>[] cs = c.getConstructors();
            Arrays.sort(cs, Comparator.comparing(Constructor::toGenericString));
            for (Constructor<?> k : cs) {
                int mod = k.getModifiers();
                if (memberHidden(c, "<init>", descriptor(k.getParameterTypes(), void.class)) || !Modifier.isPublic(mod) || Modifier.isInterface(mod) || Modifier.isAbstract(mod)) continue;
                out.append(first ? "" : ", ");
                first = false;
                out.append("{\"params\": ").append(types(k.getGenericParameterTypes(), k.isVarArgs())).append("}");
            }
        }
        out.append("]}");
    }

    private static void writeGlobals(StringBuilder out, Class<?> g) throws Exception {
        Method nameM = luaMethod.getMethod("name");
        Method globalM = luaMethod.getMethod("global");
        Method[] ms = g.getMethods();
        Arrays.sort(ms, Comparator.comparing(Method::getName).thenComparing(Method::toGenericString));
        out.append("[");
        boolean first = true;
        for (Method m : ms) {
            Annotation a = m.getAnnotation(luaMethod);
            if (a == null) continue;
            if (!(Boolean) globalM.invoke(a)) continue;
            String name = (String) nameM.invoke(a);
            if (name.isEmpty()) name = m.getName();
            out.append(first ? "\n  " : ",\n  ");
            first = false;
            out.append("{\"name\": ").append(q(name));
            out.append(", \"javaName\": ").append(q(m.getName()));
            out.append(", \"static\": ").append(Modifier.isStatic(m.getModifiers()));
            out.append(", \"params\": ").append(types(m.getGenericParameterTypes(), m.isVarArgs()));
            out.append(", \"returns\": ").append(q(typeName(m.getGenericReturnType())));
            out.append("}");
        }
        out.append("]");
    }

    // ------------------------------------------------------------------------------------
    // @HiddenFromLua, read from the class-file bytes. The reflection annotation API parses
    // every annotation on an element, and resolving an enum-valued annotation runs that
    // enum's static initializer (game code). Reading the RuntimeVisibleAnnotations
    // attribute directly answers the same question without running anything.
    // ------------------------------------------------------------------------------------

    /** Per class: "C" when the class is hidden, and name+descriptor of every hidden member. */
    private static final java.util.Map<Class<?>, java.util.Set<String>> hiddenCache = new java.util.HashMap<>();

    private static boolean classHidden(Class<?> c) {
        return hiddenOf(c).contains("C");
    }

    private static boolean memberHidden(Class<?> c, String name, String desc) {
        return hiddenOf(c).contains(name + desc);
    }

    private static java.util.Set<String> hiddenOf(Class<?> c) {
        java.util.Set<String> got = hiddenCache.get(c);
        if (got != null) return got;
        java.util.Set<String> set = new java.util.HashSet<>();
        String res = c.getName().replace('.', '/') + ".class";
        try (java.io.InputStream in = c.getClassLoader() == null ? null : c.getClassLoader().getResourceAsStream(res)) {
            if (in != null) readHidden(new java.io.DataInputStream(new java.io.BufferedInputStream(in)), set);
        } catch (IOException e) {
            throw new RuntimeException("cannot read " + res + ": " + e.getMessage());
        }
        hiddenCache.put(c, set);
        return set;
    }

    private static void readHidden(java.io.DataInputStream in, java.util.Set<String> set) throws IOException {
        if (in.readInt() != 0xCAFEBABE) throw new IOException("not a class file");
        in.readUnsignedShort();
        in.readUnsignedShort();
        int n = in.readUnsignedShort();
        String[] utf = new String[n];
        for (int i = 1; i < n; i++) {
            int tag = in.readUnsignedByte();
            switch (tag) {
                case 1: utf[i] = in.readUTF(); break;
                case 3: case 4: in.readInt(); break;
                case 5: case 6: in.readLong(); i++; break;
                case 7: case 8: case 16: case 19: case 20: in.readUnsignedShort(); break;
                case 9: case 10: case 11: case 12: case 17: case 18: in.readInt(); break;
                case 15: in.readUnsignedByte(); in.readUnsignedShort(); break;
                default: throw new IOException("constant pool tag " + tag);
            }
        }
        in.readUnsignedShort();
        in.readUnsignedShort();
        in.readUnsignedShort();
        int ifs = in.readUnsignedShort();
        for (int i = 0; i < ifs; i++) in.readUnsignedShort();
        for (int pass = 0; pass < 2; pass++) {
            int count = in.readUnsignedShort();
            for (int i = 0; i < count; i++) {
                in.readUnsignedShort();
                String name = utf[in.readUnsignedShort()];
                String desc = utf[in.readUnsignedShort()];
                if (attributesHide(in, utf)) set.add(name + desc);
            }
        }
        if (attributesHide(in, utf)) set.add("C");
    }

    private static boolean attributesHide(java.io.DataInputStream in, String[] utf) throws IOException {
        boolean hide = false;
        int attrs = in.readUnsignedShort();
        for (int a = 0; a < attrs; a++) {
            String an = utf[in.readUnsignedShort()];
            int len = in.readInt();
            byte[] body = in.readNBytes(len);
            if (!"RuntimeVisibleAnnotations".equals(an) && !"RuntimeInvisibleAnnotations".equals(an)) continue;
            java.io.DataInputStream b = new java.io.DataInputStream(new java.io.ByteArrayInputStream(body));
            int na = b.readUnsignedShort();
            for (int k = 0; k < na; k++) {
                if (HIDDEN.equals(utf[b.readUnsignedShort()]) && "RuntimeVisibleAnnotations".equals(an)) hide = true;
                skipPairs(b);
            }
        }
        return hide;
    }

    private static void skipPairs(java.io.DataInputStream b) throws IOException {
        int pairs = b.readUnsignedShort();
        for (int p = 0; p < pairs; p++) {
            b.readUnsignedShort();
            skipValue(b);
        }
    }

    private static void skipValue(java.io.DataInputStream b) throws IOException {
        int tag = b.readUnsignedByte();
        switch (tag) {
            case 'e': b.readUnsignedShort(); b.readUnsignedShort(); break;
            case '@': b.readUnsignedShort(); skipPairs(b); break;
            case '[': { int n = b.readUnsignedShort(); for (int i = 0; i < n; i++) skipValue(b); break; }
            default: b.readUnsignedShort();
        }
    }

    private static String descriptor(Class<?>[] params, Class<?> ret) {
        StringBuilder b = new StringBuilder("(");
        for (Class<?> p : params) b.append(descriptor(p));
        return b.append(')').append(descriptor(ret)).toString();
    }

    private static String descriptor(Class<?> c) {
        if (c.isArray()) return c.getName().replace('.', '/');
        if (c == void.class) return "V";
        if (c == boolean.class) return "Z";
        if (c == byte.class) return "B";
        if (c == char.class) return "C";
        if (c == short.class) return "S";
        if (c == int.class) return "I";
        if (c == long.class) return "J";
        if (c == float.class) return "F";
        if (c == double.class) return "D";
        return "L" + c.getName().replace('.', '/') + ";";
    }

    private static String types(Type[] ts, boolean varArgs) {
        StringBuilder b = new StringBuilder("[");
        for (int i = 0; i < ts.length; i++) {
            String t = typeName(ts[i]);
            if (varArgs && i == ts.length - 1 && t.endsWith("[]")) t = t.substring(0, t.length() - 2) + "...";
            b.append(i == 0 ? "" : ", ").append(q(t));
        }
        return b.append("]").toString();
    }

    private static String typeName(Type t) {
        return t.getTypeName();
    }

    private static String q(String s) {
        StringBuilder b = new StringBuilder("\"");
        for (char ch : s.toCharArray()) {
            switch (ch) {
                case '"': b.append("\\\""); break;
                case '\\': b.append("\\\\"); break;
                case '\n': b.append("\\n"); break;
                case '\r': b.append("\\r"); break;
                case '\t': b.append("\\t"); break;
                default:
                    if (ch < 0x20) b.append(String.format("\\u%04x", (int) ch));
                    else b.append(ch);
            }
        }
        return b.append("\"").toString();
    }
}
